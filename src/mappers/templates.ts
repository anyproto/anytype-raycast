import { DisplayTemplate, Template } from "../models";
import { getIconWithFallback } from "../utils/icon";

/**
 * Map raw `Template` objects from the API into display-ready data (e.g., icon).
 */
export async function mapTemplates(templates: Template[]): Promise<DisplayTemplate[]> {
  return Promise.all(
    templates.map(async (template) => {
      return mapTemplate(template);
    }),
  );
}

/**
 * Map raw `Template` object from the API into display-ready data (e.g., icon).
 */
export async function mapTemplate(template: Template): Promise<DisplayTemplate> {
  const icon = await getIconWithFallback(template.icon, "template");

  return {
    ...template,
    name: template.name || "Untitled",
    icon: icon,
  };
}
