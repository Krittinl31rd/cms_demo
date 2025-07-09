// import React, { useState, useEffect } from "react";

// const Test = () => {
//   const [visible, setVisible] = useState(false);

//   useEffect(() => {
//     const toggleVisibility = () => {
//       console.log("scrollY:", window.scrollY);
//       setVisible(window.scrollY > 100);
//     };

//     window.addEventListener("scroll", toggleVisibility);
//     toggleVisibility();

//     return () => window.removeEventListener("scroll", toggleVisibility);
//   }, []);

//   return (
//     <div>
//       <div className="h-[2000px] bg-gradient-to-b from-white to-gray-200 p-10">
//         <h1 className="text-4xl font-bold">Scroll Down</h1>
//       </div>
//       {visible && (
//         <button
//           onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
//           className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg"
//         >
//           ↑
//         </button>
//       )}
//     </div>
//   );
// };

import React, { useEffect, useState } from "react";
import OneSignal from "react-onesignal";

const Test = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initOneSignal = async () => {
      if (typeof window === "undefined") return;

      await OneSignal.init({
        appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
        autoRegister: false, // สำคัญ! เพื่อให้เรา control เอง
        allowLocalhostAsSecureOrigin: true,
      });

      const subscribed = await OneSignal.User.PushSubscription.optedIn;
      setIsSubscribed(subscribed);
      setLoading(false);
    };

    initOneSignal();
  }, []);

  const handleSubscribe = async () => {
    try {
      await OneSignal.Notifications.requestPermission();

      const permission = await OneSignal.Notifications.permission;
      console.log("Permission result:", permission);

      if (!permission) {
        alert("Notifications permission denied or dismissed.");
        return;
      }

      const isSubscribedNow = await OneSignal.User.PushSubscription.optedIn;

      // if (isSubscribedNow) {
      //   console.log("User is subscribed");
      //   setIsSubscribed(true); // <== อัปเดตสถานะที่นี่!
      // } else {
      //   console.log("User not subscribed yet");
      // }
    } catch (err) {
      console.error("Subscription failed", err);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await OneSignal.User.PushSubscription.optOut();
      setIsSubscribed(false);
      console.log("❌ Unsubscribed");
    } catch (err) {
      console.error("Unsubscribe failed", err);
    }
  };

  function pushSubscriptionChangeListener(event) {
    console.log("event.previous.id", event.previous.id);
    console.log("event.current.id", event.current.id);
    console.log("event.previous.token", event.previous.token);
    console.log("event.current.token", event.current.token);
    console.log("event.previous.optedIn", event.previous.optedIn);
    console.log("event.current.optedIn", event.current.optedIn);
  }

  OneSignal.User.PushSubscription.addEventListener(
    "change",
    pushSubscriptionChangeListener
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Test Notification Subscribe</h1>

      {loading ? (
        <p>Loading...</p>
      ) : isSubscribed ? (
        <button
          onClick={handleUnsubscribe}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          ❌ Unsubscribe Notification
        </button>
      ) : (
        <button
          onClick={handleSubscribe}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          🔔 Subscribe Notification
        </button>
      )}
    </div>
  );
};

export default Test;
