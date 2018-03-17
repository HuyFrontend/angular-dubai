/**
 * Combine all actions to reducer
 * 
 * @param {any} [state=initalState]
 * @param {any} action
 * @returns
*/
export const combineActionsToReducer = (combineActions, initalState)  => (state = initalState, action) => {
  const { type: actionType } = action;
  
  if(actionType && (combineActions[actionType] && typeof combineActions[actionType] === 'function')){
    return combineActions[actionType](state, action);
  }
  return state;
}