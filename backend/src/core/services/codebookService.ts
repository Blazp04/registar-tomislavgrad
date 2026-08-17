import type { CreateCodebookDTO, UpdateCodebookDTO } from "../../dto/codebook.js";
import type { CodebookType } from "../database/codebook-schema.js";
import { codebookRepository } from "../repositories/codebookRepository.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import { auditService } from "./auditService.js";

export const codebookService = {
  getAllByType(type: CodebookType, includeUnofficial = false) {
    return codebookRepository.findAllByType(type, includeUnofficial);
  },

  async create(data: CreateCodebookDTO, userId?: string, ipAddress?: string | null) {
    const existing = await codebookRepository.findByTypeAndName(data.type, data.name);
    if (existing) throw new ConflictError("Stavka s tim nazivom već postoji");
    const item = await codebookRepository.create({ ...data, createdBy: userId });
    await auditService.record({ actorId: userId, action: "codebook.create", entityType: "codebook", entityId: item.id, after: item, ipAddress });
    return item;
  },

  async suggest(type: CodebookType, name: string, userId: string) {
    const existing = await codebookRepository.findByTypeAndName(type, name);
    if (existing) return existing;
    return codebookRepository.create({ type, name, isOfficial: false, createdBy: userId });
  },

  async update(id: string, data: UpdateCodebookDTO, userId?: string, ipAddress?: string | null) {
    const item = await codebookRepository.findById(id);
    if (!item) throw new NotFoundError("Stavka šifrarnika nije pronađena");
    if (data.name && data.name !== item.name) {
      const duplicate = await codebookRepository.findByTypeAndName(item.type, data.name);
      if (duplicate) throw new ConflictError("Stavka s tim nazivom već postoji");
    }
    const updated = await codebookRepository.update(id, { ...data, updatedBy: userId });
    await auditService.record({ actorId: userId, action: "codebook.update", entityType: "codebook", entityId: id, before: item, after: updated, ipAddress });
    return updated;
  },

  async remove(id: string, userId?: string, ipAddress?: string | null) {
    const item = await codebookRepository.findById(id);
    if (!item) throw new NotFoundError("Stavka šifrarnika nije pronađena");
    const deleted = await codebookRepository.softDelete(id, userId);
    await auditService.record({ actorId: userId, action: "codebook.delete", entityType: "codebook", entityId: id, before: item, ipAddress });
    return deleted;
  },
};
