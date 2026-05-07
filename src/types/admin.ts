import type { FieldConfig, ResourceName } from "@/lib/resources";

export type AdminUser = {
  id: string | number;
  name?: string;
  email: string;
  rol?: string;
};

export type AdminRecord = {
  id?: string | number;
  [key: string]: unknown;
};

export type ClientResource = {
  key: ResourceName;
  label: string;
  fields: FieldConfig[];
};

export type PackageOption = {
  id?: string | number;
  nombre?: string;
  codigo?: string | number;
};
