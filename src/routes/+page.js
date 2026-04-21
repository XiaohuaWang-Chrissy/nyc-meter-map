import greatTrees from '$lib/data/great-trees.json';
import planetrees from '$lib/data/planetrees-by-nta.json';

export function load() {
  return {
    showHeader: true,
    showFooter: true,
    greatTrees,
    planetrees,
  };
}