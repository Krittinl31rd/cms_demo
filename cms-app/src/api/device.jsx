import axios from "axios";

export const CreateDevice = async (token, form) =>
  await axios.post(import.meta.env.VITE_API_URL + "/create-device", form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const UpdateDevice = async (token, form, room_id) =>
  await axios.put(
    import.meta.env.VITE_API_URL +
      `/update-device/${room_id}/${form.device_id}`,
    form,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const DeleteDevice = async (token, room_id, device_id) =>
  await axios.delete(
    import.meta.env.VITE_API_URL + `/delete-device/${room_id}/${device_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
