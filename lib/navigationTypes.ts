import { Session } from '@supabase/supabase-js';

/**
 * Centralized type definitions for React Navigation.
 * This file ensures that all navigation-related components share the same
 * type definitions for routes and their parameters, preventing common errors
 * and improving autocompletion.
 *
 * See: https://reactnavigation.org/docs/typescript/
 */
export type RootStackParamList = {
    Auth: undefined;
    Root: undefined;
    Taxi: undefined;
    Delivery: undefined;
    Settings: undefined;
    ConfirmDeletion: undefined;
    ResetPassword: undefined;
};