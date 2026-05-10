/**
 * Helpers para plantillas Handlebars
 * @en Handlebars template helpers
 */

const SKILLS: string[] = [
  "HTML5", "CSS3", "CSSGrid", "Flexbox", "JavaScript", "jQuery", "Node",
  "Angular", "VueJS", "ReactJS", "React Hooks", "Redux", "Apollo",
  "GraphQL", "TypeScript", "PHP", "Laravel", "Symfony", "Python",
  "Django", "ORM", "Sequelize", "Mongoose", "SQL", "MVC", "SASS", "WordPress",
];

export const seleccionarSkills = (seleccionadas: string[] = [], opciones: any): string => {
  const html = SKILLS.map((skill) => {
    const activeClass = seleccionadas.includes(skill) ? ' class="activo"' : "";
    return `<li${activeClass}>${skill}</li>`;
  }).join("");

  return opciones.fn(this).html = html;
};

export const tipoContrato = (seleccionado: string, opciones: any): string => {
  const result = opciones.fn(this);
  return result.replace(new RegExp(` value="${seleccionado}"`), '$& selected="selected"');
};

export const mostrarAlertas = (errores: Record<string, string[]> = {}, alertas: any): string => {
  const categoria = Object.keys(errores);

  if (!categoria.length) {
    return "";
  }

  const html = categoria
    .flatMap((cat) => errores[cat].map((error) => `<div class="${cat} alerta">${error}</div>`))
    .join("");

  return html;
};

export default {
  seleccionarSkills,
  tipoContrato,
  mostrarAlertas,
};