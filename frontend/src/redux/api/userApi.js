import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setIsAuthenticated, setLoading, setUser } from '../features/userSlice';

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
    tagTypes: ["User", "AdminUsers","AdminUser"],
    endpoints: (builder) => ({ 
        getMe: builder.query({
            query: ()=>`/me`,
            transformResponse: (result)=>result.user,
            async onQueryStarted(args, {dispatch, queryFulfilled}){
                try{
                    const {data}=await queryFulfilled;
                    dispatch(setUser(data));
                    dispatch(setIsAuthenticated(true));
                    dispatch(setLoading(false));
                } catch (error){
                    dispatch(setLoading(false));
                    console.log(error);
                }
            },
            providesTags: ["User"],
        }),
        updateUser: builder.mutation({
            query(body){
                return {
                    url:"/me/update",
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["User"],
        }),
        uploadAvatar: builder.mutation({
            query(body){
                return {
                    url:"/me/upload_avatar",
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["User"],
        }),
        updatePassword: builder.mutation({
            query(body){
                return {
                    url:"/password/update",
                    method: "PUT",
                    body,
                };
            },
        }),
        forgotPassword: builder.mutation({
            query(body){
                return {
                    url:"/password/forgot",
                    method: "POST",
                    body,
                };
            },
        }),
        getAdminUsers: builder.query({
            query : ()=>`/admin/users`,
            providesTags: ["AdminUsers"]
        }),
        getUserDetails: builder.query({
            query : (id)=>`/admin/users/${id}`,
            providesTags: ["AdminUser"]
        }),
        aupdateUser: builder.mutation({
            query({id,body}){
                return {
                    url:`/admin/users/${id}`,
                    method: "PUT",
                    body,
                };
            },
            invalidatesTags: ["AdminUsers"]
        }),
        deleteUser: builder.mutation({
            query(id){
                return {
                    url:`/admin/users/${id}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: ["AdminUsers"]
        }),
    }),
});

export const { 
    useGetMeQuery, 
    useUpdateUserMutation, 
    useUploadAvatarMutation, 
    useUpdatePasswordMutation,
    useForgotPasswordMutation,
    useGetAdminUsersQuery,
    useGetUserDetailsQuery,
    useAupdateUserMutation,
    useDeleteUserMutation
} = userApi;
