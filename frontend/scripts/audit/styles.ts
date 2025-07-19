import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import postcss from 'postcss';
import postcssScss from 'postcss-scss';
import type { Root } from 'postcss';

interface StyleUsage {
  component: string;
  file: string;
  styles: {
    [key: string]: {
      count: number;
      files: Set<string>;
    };
  };
}

const PAGES_DIR = path.join(process.cwd(), 'src/pages');
const COMPONENTS_DIR = path.join(process.cwd(), 'src/components');
const STYLES_DIR = path.join(process.cwd(), 'src/styles');

async function auditStyles() {
  console.log('🔍 Iniciando auditoría de estilos...');
  
  // 1. Encontrar todos los archivos de páginas
  const pageFiles = await glob('**/*.{tsx,ts,js,jsx}', { cwd: PAGES_DIR });
  
  // 2. Analizar cada archivo
  const styleUsage: StyleUsage[] = [];
  
  for (const file of pageFiles) {
    const filePath = path.join(PAGES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extraer estilos en línea
    const inlineStyles = extractInlineStyles(content);
    
    // Extraer clases de estilos
    const classNames = extractClassNames(content);
    
    // Extraer estilos de styled-components
    const styledComponents = await extractStyledComponents(content);
    
    styleUsage.push({
      component: file,
      file: filePath,
      styles: {
        ...inlineStyles,
        ...classNames,
        ...styledComponents
      }
    });
  }
  
  // 3. Generar informe
  generateReport(styleUsage);
  
  console.log('✅ Auditoría completada. Ver el informe en styles-audit-report.md');
}

function extractInlineStyles(content: string) {
  const styleRegex = /style=\{([^}]+)\}/g;
  const styles: Record<string, { count: number; files: Set<string> }> = {};
  
  let match;
  while ((match = styleRegex.exec(content)) !== null) {
    const styleContent = match[1];
    const stylePairs = styleContent.split(';').filter(Boolean);
    
    for (const pair of stylePairs) {
      const [key, value] = pair.split(':').map(s => s.trim());
      if (key && value) {
        if (!styles[key]) {
          styles[key] = { count: 0, files: new Set() };
        }
        styles[key].count++;
        styles[key].files.add('inline');
      }
    }
  }
  
  return styles;
}

function extractClassNames(content: string) {
  const classRegex = /className=["']([^"']+)["']/g;
  const styles: Record<string, { count: number; files: Set<string> }> = {};
  
  let match;
  while ((match = classRegex.exec(content)) !== null) {
    const classNames = match[1].split(' ').filter(Boolean);
    
    for (const className of classNames) {
      if (!styles[className]) {
        styles[className] = { count: 0, files: new Set() };
      }
      styles[className].count++;
      styles[className].files.add('class');
    }
  }
  
  return styles;
}

async function extractStyledComponents(content: string) {
  const styledRegex = /styled\.(\w+)\(([^)]*)\)\s*`([\s\S]*?)`/g;
  const styles: Record<string, { count: number; files: Set<string> }> = {};
  
  const promises: Promise<void>[] = [];
  let match;
  while ((match = styledRegex.exec(content)) !== null) {
    const [_, component, props, styleContent] = match;
    
    const promise = postcss().process(styleContent, {
      from: undefined,
      parser: postcssScss
    }).then(result => {
      result.root.walkDecls(decl => {
        const prop = decl.prop;
        if (!styles[prop]) {
          styles[prop] = { count: 0, files: new Set() };
        }
        styles[prop].count++;
        styles[prop].files.add('styled');
      });
    });
    promises.push(promise);
  }
  
  // Wait for all promises to complete
  await Promise.all(promises);
  
  return styles;
}

function generateReport(styleUsage: StyleUsage[]) {
  let report = '# 📊 Informe de Auditoría de Estilos\n\n';
  
  // Resumen general
  report += '## 📋 Resumen General\n\n';
  report += `- Total de páginas analizadas: ${styleUsage.length}\n`;
  
  // Análisis por página
  report += '## 📄 Análisis por Página\n\n';
  
  for (const page of styleUsage) {
    report += `### ${page.component}\n`;
    report += `**Archivo:** ${page.file}\n\n`;
    
    if (Object.keys(page.styles).length > 0) {
      report += '| Propiedad | Tipo | Usos |\n';
      report += '|----------|------|------|\n';
      
      for (const [prop, data] of Object.entries(page.styles)) {
        const types = Array.from(data.files).join(', ');
        report += `| \`${prop}\` | ${types} | ${data.count} |\n`;
      }
    } else {
      report += 'No se encontraron estilos en esta página.\n';
    }
    
    report += '\n---\n\n';
  }
  
  // Recomendaciones
  report += '## 💡 Recomendaciones\n\n';
  report += '1. **Estandarizar estilos**: Identifica y estandariza los estilos más utilizados.\n';
  report += '2. **Eliminar duplicados**: Busca y elimina estilos duplicados.\n';
  report += '3. **Optimizar rendimiento**: Considera extraer estilos comunes a componentes reutilizables.\n';
  
  // Guardar el informe
  fs.writeFileSync('styles-audit-report.md', report);
}

// Ejecutar la auditoría
auditStyles().catch(console.error);
