import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import cloneDeep from 'lodash/cloneDeep';

import { combineActionsToReducer, swapItem } from 'utils';
import { IFormState, IAppState, FormType, FormStatus } from './app-interfaces';

const INIT_FORM: string = 'FORM_STATE/INIT_FORM';
const RESET_FORM: string = 'FORM_STATE/RESET_FORM';
const FORM_SUBMITTED: string = 'FORM_STATE/FORM_SUBMITTED';
const FORM_CHANGED: string = 'FORM_STATE/FORM_CHANGED';

const UPDATE_EXTRA_FORM_FIELD_BY_KEY: string = 'FORM_STATE/UPDATE_EXTRA_FORM_FIELD_BY_KEY';
const UPDATE_FORMCONTROL_BY_KEY: string = 'FORM_STATE/UPDATE_FORMCONTROL_BY_KEY';
const ADD_ITEM_TO_FORMARRAY: string = 'FORM_STATE/ADD_ITEM_TO_FORMARRAY';
const UPDATE_FORMARRAY_BY_IDX: string = 'FORM_STATE/UPDATE_FORMARRAY_BY_IDX';

const UPDATE_FORM_VALUES: string = 'FORM_STATE/UPDATE_FORM_VALUES';
const UPDATE_FORM_VALUE_BY_KEY: string = 'FORM_STATE/UPDATE_FORM_VALUE_BY_KEY';
const UPDATE_FORM_VALUE_BY_KEYS: string = 'FORM_STATE/UPDATE_FORM_VALUE_BY_KEYS';
const RESET_STATE: string = 'FORM_STATE/RESET_STATE';
const UPDATE_FORM_STATE: string = 'FORM_STATE/UPDATE_FORM_STATE';
const UPDATE_FORM_STATE_BY_KEY: string = 'FORM_STATE/UPDATE_FORM_STATE_BY_KEY';
const UPDATE_FORM_STATE_BY_KEYS: string = 'FORM_STATE/UPDATE_FORM_STATE_BY_KEYS';

const UPDATE_FORM_GROUP_STATE_BY_KEY: string = 'FORM_STATE/UPDATE_FORM_GROUP_STATE_BY_KEY';

interface IFormActions {
    initForm(type: FormType, values: any, extraValues?: object): void;
    updateExtraField(extraValues: object): void;
    updateFormControlByKey(property: string, value: any, controlState: any): void;
    updateFormArrayByIdx(parentKey: string, idx: number, { propertyKey, propertyValue, propertyState }): void;
    addItemToArray(propertyKey: string, item: any): void;
    updateFormValues(values: any, extraValues?: object): void;
    updateFormValueByKey(property: string, value: any, extraValues?: object): void;
    updateFormValueByKeys(propertiesValues: any, extraValues?: object): void;
    updateFormStateByKey(property: string, controlState: any): void;
    updateFormStateByKeys(propertiesState: any): void;

    updateFormGroupStatus(formGroupKey: string, formState: FormStatus): void;
}

/**
 *
 *
 * @export
 * @class FormActions
 */
@Injectable()
export class FormActions {
    constructor(private redux: NgRedux<IFormState>) {}

    initForm(type: FormType, values: any, extraValues: object = {}): void {
        this.redux.dispatch({ type: INIT_FORM, payload: { type, values, extraValues }});
    };

    updateFormGroupStatus(formGroupKey: string, formStatus: FormStatus): void {
        this.redux.dispatch({
            type: UPDATE_FORM_GROUP_STATE_BY_KEY,
            payload: { formGroupKey, formStatus }
        });
    }

    resetForm(): void {
        this.redux.dispatch({ type: RESET_FORM });
    };

    /**
     * It helps to update all extra values.
     *
     * @param {object} extraValues
     *
     * @memberOf FormActions
     */
    updateExtraField(extraValues: object) {
        this.redux.dispatch({
            type: UPDATE_EXTRA_FORM_FIELD_BY_KEY,
            payload: { extraValues }
        })
    }

    /**
     * Update value & state of control to state.
     *
     * @param {string} property
     * @param {*} value
     * @param {*} controlState
     *
     * @memberOf FormActions
     */
    updateFormControlByKey(property: string, value: any, controlState: any): void {
        this.redux.dispatch({
            type: UPDATE_FORMCONTROL_BY_KEY,
            payload: {
                property,
                value,
                controlState
            }
        })
    }

    /**
     * Update object at index or Array.
     *
     * @param {string} parentKey
     * @param {number} idx
     * @param {any} { propertyKey, propertyValue, propertyState }
     *
     * @memberOf FormActions
     */
    updateFormArrayByIdx(parentKey: string, idx: number, { propertyKey, propertyValue, propertyState }): void {
        this.redux.dispatch({
            type: UPDATE_FORMARRAY_BY_IDX,
            payload: { parentKey, idx, propertyKey, propertyValue, propertyState }
        });
    }

    /**
     * Add item to array.
     *
     * @param {string} propertyKey
     * @param {*} item
     *
     * @memberOf FormActions
     */
    addItemToArray(propertyKey: string, item: any) {
        this.redux.dispatch({
            type: ADD_ITEM_TO_FORMARRAY,
            payload: {
                propertyKey,
                item
            }
        })
    }

    /**
     * Update Form values and Extra values if any.
     *
     * @param {*} values
     * @param {object} [extraValues={}]
     *
     * @memberOf FormActions
     */
    updateFormValues(values: any, extraValues: object = {}): void {
        this.redux.dispatch({
            type: UPDATE_FORM_VALUES,
            payload: { values, extraValues }
        })
    }

    /**
     * To update any field values in form.
     *
     * @param {string} property
     * @param {*} value
     * @param {object} [extraValues={}]
     *
     * @memberOf FormActions
     */
    updateFormValueByKey(property: string, value: any, extraValues: object = {}): void {
        this.redux.dispatch({
            type: UPDATE_FORM_VALUE_BY_KEY,
            payload: { property, value, extraValues }
        })
    }

    /**
     * To update any field values by Keys in form,
     * and include extra values also
     *
     * @param {any} propertiesValues
     * @param {object} [extraValues={}]
     *
     * @memberOf FormActions
     */
    updateFormValueByKeys(propertiesValues: any, extraValues: object = {}): void {
        this.redux.dispatch({
            type: UPDATE_FORM_VALUE_BY_KEYS,
            payload: { propertiesValues, extraValues }
        })
    }

    /**
     * After check validate data on form,
     * this function to help re-update form state in store.
     *
     * @param {string} property
     * @param {*} controlState
     *
     * @memberOf FormActions
     */
    updateFormStateByKey(property: string, controlState: any): void {
        this.redux.dispatch({
            type: UPDATE_FORM_STATE_BY_KEY,
            payload: { property, controlState }
        })
    }

    /**
     * After check validate data on form,
     * this function to help re-update form state in store.
     *
     * @param {any} propertiesState
     *
     * @memberOf FormActions
     */
    updateFormStateByKeys(propertiesState: any): void {
        this.redux.dispatch({
            type: UPDATE_FORM_STATE_BY_KEYS,
            payload: { propertiesState }
        })
    }
}

const formInitialState: IFormState = {
    type: '',
    entityId: '',
    isSubmitted: false,
    formGroupState: {},
    isFormChanged: false,
    values: {},
    errors: {}
};

export const formReducer = combineActionsToReducer(
    {
        [INIT_FORM]: (state, action) => {
            const { payload: { type, values, extraValues } } = action;
            return {
                type,
                isSubmitted: false,
                isFormChanged: false,
                values,
                ...extraValues,
                errors: {}
            };
        },
        [UPDATE_FORM_GROUP_STATE_BY_KEY]: (state, action) => {
            const { payload: { formGroupKey, formStatus } } = action;
            return {
                ...state,
                formGroupState: {
                    ...state.formGroupState,
                    [formGroupKey]: formStatus
                }
            };
        },
        [RESET_FORM]: (state, action) => {
            return formInitialState;
        },
        [UPDATE_EXTRA_FORM_FIELD_BY_KEY]: (state, action) => {
            const { payload: { extraValues } } = action;
            return {
                ...state,
                ...extraValues
            };
        },
        [UPDATE_FORMCONTROL_BY_KEY]: (state, action) => {
            const { payload: { property, value, controlState } } = action;
            const { errors } = state;
            let newControlState = {};
            if(controlState) {
                const propertyError = errors[property];
                if(controlState instanceof Array) {
                  newControlState = controlState;
                } else {
                  newControlState = {
                      ...controlState
                  }
                }
            }
            return {
                ...state,
                isFormChanged: (state.values[property] !== value) || state.isFormChanged,
                values: {
                    ...state.values,
                    [property]: value
                },
                errors: {
                    ...state.errors,
                    [property]: { ...newControlState }
                }
            }
        },
        [UPDATE_FORMARRAY_BY_IDX]: (state, action) => {
            const { payload: { parentKey, idx, propertyKey, propertyValue, propertyState } } = action;
            const parentValues = cloneDeep(state.values[parentKey]);
            parentValues[idx] = {
                ...parentValues[idx],
                [propertyKey]: propertyValue
            }
            let parentErrors = cloneDeep(state.errors[parentKey]);
            parentErrors = parentErrors ? parentErrors : [];
            let newPropertyState = propertyState;
            if(propertyState && Object.keys(propertyState).length > 0) {
                propertyState.invalid = true;
                if(parentErrors.length > 0 && parentErrors[idx]) {
                    const tempVal = parentErrors[idx][propertyKey];
                    newPropertyState = tempVal ? { ...tempVal, ...newPropertyState } : newPropertyState;
                }
            }
            parentErrors[idx] = {
                ...parentErrors[idx],
                [propertyKey]: newPropertyState
            }
            return {
                ...state,
                isFormChanged: true,
                values: { ...state.values, [parentKey]: parentValues },
                errors: { ...state.errors, [parentKey]: [ ...parentErrors ] }
            }
        },
        [ADD_ITEM_TO_FORMARRAY]: (state, action) => {
            const { payload: { propertyKey, item } } = action;
            const { values } = state;
            let currentItem = (values[propertyKey] && values[propertyKey].length > 0) ? values[propertyKey]: [];
            currentItem.push(item);
            return {
                ...state,
                values: {
                    ...values,
                    [propertyKey]: [ ...currentItem ]
                },
            }
        },
        [UPDATE_FORM_VALUES]: (state, action) => {
            const { payload: { values, extraValues } } = action;
            return {
                ...state,
                values: {
                    ...state.values,
                    ...values
                },
                ...extraValues
            }
        },
        [UPDATE_FORM_VALUE_BY_KEY]: (state, action) => {
            const { payload: { property, value, extraValues } } = action;
            return {
                ...state,
                values: {
                    ...state.values,
                    [property]: value
                },
                ...extraValues
            }
        },
        [UPDATE_FORM_VALUE_BY_KEYS]: (state, action) => {
            const { payload: { propertiesValues, extraValues } } = action;
            return {
                ...state,
                values: {
                    ...state.values,
                    ...propertiesValues
                },
                ...extraValues
            }
        },
        [UPDATE_FORM_STATE_BY_KEY]: (state, action) => {
            const { payload: { property, controlState } } = action;
            const { errors } = state;
            const propertyError = errors[property];
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [property]: {
                        ...propertyError,
                        ...controlState
                    }
                }
            }
        },
        [UPDATE_FORM_STATE_BY_KEYS]: (state, action) => {
            const { payload: { propertiesState } } = action;
            return {
                ...state,
                errors: {
                    ...state.errors,
                    ...propertiesState
                }
            }
        }
    },
    formInitialState);
