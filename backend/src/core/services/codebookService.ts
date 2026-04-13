import { codebookRepository } from "../repositories/codebookRepository.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import type { CreateCodebookDTO, UpdateCodebookDTO } from "../../dto/codebook.js";

export const codebookService = {
  async getById(id: string) {
    const item = await codebookRepository.findById(id);
    if (!item) throw new NotFoundError("Stavka šifrarnika nije pronađena");
    return item;
  },

  async getAllByType(type: "faculty" | "field_of_study" | "high_school_profession" | "city") {
    return codebookRepository.findAllByType(type);
  },

  async create(data: CreateCodebookDTO, userId?: string) {
    const existing = await codebookRepository.findByTypeAndName(data.type, data.name);
    if (existing) throw new ConflictError("Stavka s tim imenom već postoji u šifrarniku");
    return codebookRepository.create({ ...data, createdBy: userId });
  },

  async findOrCreate(type: "faculty" | "field_of_study" | "high_school_profession" | "city", name: string, userId?: string) {
    const existing = await codebookRepository.findByTypeAndName(type, name);
    if (existing) return existing;
    return codebookRepository.create({ type, name, createdBy: userId });
  },

  async update(id: string, data: UpdateCodebookDTO, userId?: string) {
    const item = await codebookRepository.findById(id);
    if (!item) throw new NotFoundError("Stavka šifrarnika nije pronađena");
    return codebookRepository.update(id, { name: data.name, updatedBy: userId });
  },

  async remove(id: string, userId?: string) {
    const item = await codebookRepository.findById(id);
    if (!item) throw new NotFoundError("Stavka šifrarnika nije pronađena");
    return codebookRepository.softDelete(id, userId);
  },
};
