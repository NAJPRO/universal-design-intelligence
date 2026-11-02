// Instrument loaded build output in memory only. Used separately from timing runs.
export async function load(url,context,nextLoad){
 const result=await nextLoad(url,context);
 const points=[['/core/dist/knowledge-v2.js','constructor(context, catalog = defaultCatalogV2) {','index'],['/knowledge/dist/integrity.js','export function validateCatalog(catalog) {','legacy-validation'],['/knowledge/dist/components.js','export function validateComponentCatalog(input, catalog) {','component-validation']];
 for(const [suffix,needle,event] of points)if(url.endsWith(suffix)){
 const source=String(result.source);if(!source.includes(needle))throw Error(`Instrumentation mismatch: ${url}`);
 return {...result,source:source.replace(needle,needle+`console.error(${JSON.stringify(JSON.stringify({event}))});`)};
 }
 return result;
}
