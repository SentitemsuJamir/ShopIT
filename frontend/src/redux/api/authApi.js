import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { userApi } from './userApi';

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
    endpoints: (builder) => ({
        login: builder.mutation({
            query(body) {
                return {
                    url: "/login",
                    method: "POST",
                    body,
                };
            },
            async onQueryStarted(args, {dispatch, queryFulfilled}){
                try{
                    await queryFulfilled;
                    await dispatch(userApi.endpoints.getMe.initiate(null));
                }catch(error){
                    console.log(error);
                }
            }
        }),
        register: builder.mutation({
            query(body) {
                return {
                    url: "/register",
                    method: "POST",
                    body,
                };
            },
        }),

        logout: builder.query({
            query: () => {
              return {
                url: '/logout',
                method: 'POST',
              };
            },
          }),
        resetPassword: builder.mutation({
            query: ({token, body}) => {
              return {
                url: `/password/reset/${token}`,
                method: 'PUT',
                body,
              };
            },
          }),
          
    }),
});

export const { 
    useLoginMutation, 
    useRegisterMutation, 
    useLazyLogoutQuery, 
    useResetPasswordMutation 
} = authApi;
