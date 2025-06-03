import axios from "axios";

export const Current = async (token) =>
  await axios.get(import.meta.env.VITE_API_URL + "/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const CheckToken = async (token) =>
  await axios.get(import.meta.env.VITE_API_URL + `/register/${token}/validate`);

export const RegisterWithToken = async (token, form) =>
  await axios.post(import.meta.env.VITE_API_URL + `/register/${token}`, form);

export const CreateInvite = async ({ token, form }) =>
  await axios.post(import.meta.env.VITE_API_URL + `/invites`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const RevokeInvite = async ({ token, id }) =>
  await axios.get(import.meta.env.VITE_API_URL + `/revoke/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const ApprovesUser = async ({ token, id }) =>
  await axios.get(import.meta.env.VITE_API_URL + `/approves/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const RejectUser = async ({ token, id }) =>
  await axios.get(import.meta.env.VITE_API_URL + `/reject/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
