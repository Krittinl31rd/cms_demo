import OneSignal from "react-onesignal";
import useStore from "@/store/store";

export const initOneSignal = async () => {
  if (typeof window === "undefined") return;

  await OneSignal.init({
    appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
    notifyButton: {
      enable: true,
      position: "bottom-left",
    },
    allowLocalhostAsSecureOrigin: true,
  });

  //   const permission = await OneSignal.Notifications.permission;
  //   console.log("Notification permission:", permission);

  //   const isSubscribed = await OneSignal.User.PushSubscription.optedIn;
  //   console.log("Is Subscribed:", isSubscribed);

  const subscriptionId = OneSignal.User.PushSubscription.id;
  //   console.log("Push Subscription ID:", subscriptionId);

  const setSubscribeId = useStore.getState().setSubscribeId;
  if (subscriptionId) {
    setSubscribeId(subscriptionId);
  }
};

// import.meta.env.VITE_ONESIGNAL_APP_ID,
//   safari_web_id: "web.onesignal.auto.5f2b561a-4bc4-4806-b010-c7853696b689",
