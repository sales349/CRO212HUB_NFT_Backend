const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src');

function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else if (file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = getFiles(srcDir);
let errors = 0;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        const match = line.match(/from\s+['"]([^'"]+)['"]/);
        if (match) {
            const importPath = match[1];
            if (importPath.startsWith('.')) {
                const absoluteImportPath = path.resolve(path.dirname(file), importPath);

                // Check if it's a file (.ts, .js) or a directory with index.ts
                const possiblePaths = [
                    absoluteImportPath,
                    absoluteImportPath + '.ts',
                    absoluteImportPath + '.js',
                    path.join(absoluteImportPath, 'index.ts'),
                    path.join(absoluteImportPath, 'index.js')
                ];

                const exists = possiblePaths.some(p => fs.existsSync(p));
                if (!exists) {
                    console.log(`❌ BROKEN IMPORT in ${path.relative(process.cwd(), file)}:L${index + 1}`);
                    console.log(`   Path: "${importPath}" -> Resolved as: "${absoluteImportPath}"`);
                    errors++;
                }
            } else if (importPath.startsWith('@/')) {
                const absoluteImportPath = path.resolve(process.cwd(), importPath.replace('@/', 'src/'));
                const possiblePaths = [
                    absoluteImportPath,
                    absoluteImportPath + '.ts',
                    absoluteImportPath + '.js',
                    path.join(absoluteImportPath, 'index.ts'),
                    path.join(absoluteImportPath, 'index.js')
                ];
                const exists = possiblePaths.some(p => fs.existsSync(p));
                if (!exists) {
                    console.log(`❌ BROKEN ALIAS IMPORT in ${path.relative(process.cwd(), file)}:L${index + 1}`);
                    console.log(`   Path: "${importPath}" -> Resolved as: "${absoluteImportPath}"`);
                    errors++;
                }
            }
        }
    });
});

if (errors === 0) {
    console.log('✅ All internal imports are valid!');
} else {
    console.log(`\nFound ${errors} broken imports.`);
}
