import {sortByAnyField} from 'utils';
import {SORT_DIRECTION} from 'constant';

const MAX_SUGGESTION = 5;

export const getAllInterestNode = (interests: any[]) => {
  let results: any[] = [];
  interests.forEach(root => {
    appendLastNodeInterest(root, results);
  });
  return results.map(x => {
    x.id = x.code;
    x.value = x.names[0].text;

    return x;
  });
}

export const getInterestSuggestions = (searchText: string,
                                        interests: any[],
                                        excludeIds:string[] = []): any[] => {

    let results:any[]=[];
    interests.forEach(root=>{
      findAndAppendNode(searchText.toLowerCase(), root, results);
    });

    results = results.map(x=> {
      x.id = x.code,
      x.value = x.names[0].text
      return x;
    });

    return sortByAnyField(results, 'value', SORT_DIRECTION.ASC).slice(0, MAX_SUGGESTION)
}


const findAndAppendNode = (searchText: string, node: any, results: any[]) => {
  if (node.names[0].text.toLowerCase().indexOf(searchText) != -1) {
    appendLastNodeInterest(node, results);
  } else {
    if (node.nodes) {
      node.nodes.forEach(x => findAndAppendNode(searchText, x, results));
    }
  }
}

const appendLastNodeInterest = (node: any, results: any[]) => {
  if (node.nodes) {
    node.nodes.forEach(x => appendLastNodeInterest(x, results));
  } else {
    results.push(node);
  }
}
