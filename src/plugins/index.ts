import needTryCatch, { NeedTryCatchOptions } from './need-try-catch-plugin';
import dangerousAndOperator, { DangerousAndOperatorOptions } from './dangerous-and-operator';
import needHandlerInCatch, { NeedHandlerInCatchOptions } from './need-handler-in-catch-block';
import dangerousInitState, { DangerousInitStateOptions } from './dangerous-init-state';
import dangerousDefaultValue, { DangerousDefaultValueOptions } from './dangerous-default-value'


export type ScanPluginsConf = 
    { plugin: 'needTryCatch', options?: Omit<NeedTryCatchOptions, 'errorCollector'> } |
    { plugin: 'dangerousAndOperator', options?: Omit<DangerousAndOperatorOptions, 'errorCollector'> } |
    { plugin: 'needHandlerInCatch', options?: Omit<NeedHandlerInCatchOptions, 'errorCollector'> } |
    { plugin: 'dangerousInitState', options?: Omit<DangerousInitStateOptions, 'errorCollector'> } |
    { plugin: 'dangerousDefaultValue', options?: Omit<DangerousDefaultValueOptions, 'errorCollector'> }

export const pluginsMap = {
    needTryCatch,
    dangerousAndOperator,
    needHandlerInCatch,
    dangerousInitState,
    dangerousDefaultValue
}