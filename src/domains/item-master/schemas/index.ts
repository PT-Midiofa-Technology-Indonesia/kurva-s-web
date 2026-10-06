import z from 'zod';
import {
  booleanStringSchema,
  codeWithMaxSchema,
  descriptionOptionalSchema,
  isActiveSchema,
  nameWithMaxSchema,
  parentIdOptionalSchema,
  requiredSelectSchema,
} from '@/shared/schemas/common';

export const createItemCategorySchema = z.object({
  itemTypeId: requiredSelectSchema('Tipe item wajib dipilih'),
  code: codeWithMaxSchema,
  name: nameWithMaxSchema,
  parentId: parentIdOptionalSchema,
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});

export const editItemCategorySchema = z.object({
  itemTypeId: requiredSelectSchema('Tipe item wajib dipilih'),
  code: codeWithMaxSchema,
  name: nameWithMaxSchema,
  parentId: parentIdOptionalSchema,
  description: descriptionOptionalSchema,
  isActive: isActiveSchema,
});

export const createItemCatalogSchema = z.object({
  itemTypeId: requiredSelectSchema('Tipe item wajib dipilih'),
  itemCategoryId: requiredSelectSchema('Kategori item wajib dipilih'),
  uomId: requiredSelectSchema('UoM wajib dipilih'),
  code: codeWithMaxSchema,
  name: nameWithMaxSchema,
  description: descriptionOptionalSchema,
  isAllocatable: booleanStringSchema,
  isAsset: booleanStringSchema,
  isStock: booleanStringSchema,
  isSensitive: booleanStringSchema,
  isActive: isActiveSchema,
});

export const editItemCatalogSchema = z.object({
  itemTypeId: requiredSelectSchema('Tipe item wajib dipilih'),
  itemCategoryId: requiredSelectSchema('Kategori item wajib dipilih'),
  uomId: requiredSelectSchema('UoM wajib dipilih'),
  code: codeWithMaxSchema,
  name: nameWithMaxSchema,
  description: descriptionOptionalSchema,
  isAllocatable: booleanStringSchema,
  isAsset: booleanStringSchema,
  isStock: booleanStringSchema,
  isSensitive: booleanStringSchema,
  isActive: isActiveSchema,
});
