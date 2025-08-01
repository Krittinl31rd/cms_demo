// // // import React, { useState, useEffect } from "react";

// // // const Test = () => {
// // //   const [visible, setVisible] = useState(false);

// // //   useEffect(() => {
// // //     const toggleVisibility = () => {
// // //       console.log("scrollY:", window.scrollY);
// // //       setVisible(window.scrollY > 100);
// // //     };

// // //     window.addEventListener("scroll", toggleVisibility);
// // //     toggleVisibility();

// // //     return () => window.removeEventListener("scroll", toggleVisibility);
// // //   }, []);

// // //   return (
// // //     <div>
// // //       <div className="h-[2000px] bg-gradient-to-b from-white to-gray-200 p-10">
// // //         <h1 className="text-4xl font-bold">Scroll Down</h1>
// // //       </div>
// // //       {visible && (
// // //         <button
// // //           onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
// // //           className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg"
// // //         >
// // //           ↑
// // //         </button>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // import React, { useEffect, useState } from "react";
// // import OneSignal from "react-onesignal";

// // const Test = () => {
// //   const [isSubscribed, setIsSubscribed] = useState(false);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     const initOneSignal = async () => {
// //       if (typeof window === "undefined") return;

// //       await OneSignal.init({
// //         appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
// //         autoRegister: false, // สำคัญ! เพื่อให้เรา control เอง
// //         allowLocalhostAsSecureOrigin: true,
// //       });

// //       const subscribed = await OneSignal.User.PushSubscription.optedIn;
// //       setIsSubscribed(subscribed);
// //       setLoading(false);
// //     };

// //     initOneSignal();
// //   }, []);

// //   const handleSubscribe = async () => {
// //     try {
// //       await OneSignal.Notifications.requestPermission();

// //       const permission = await OneSignal.Notifications.permission;
// //       console.log("Permission result:", permission);

// //       if (!permission) {
// //         alert("Notifications permission denied or dismissed.");
// //         return;
// //       }

// //       const isSubscribedNow = await OneSignal.User.PushSubscription.optedIn;

// //       // if (isSubscribedNow) {
// //       //   console.log("User is subscribed");
// //       //   setIsSubscribed(true); // <== อัปเดตสถานะที่นี่!
// //       // } else {
// //       //   console.log("User not subscribed yet");
// //       // }
// //     } catch (err) {
// //       console.error("Subscription failed", err);
// //     }
// //   };

// //   const handleUnsubscribe = async () => {
// //     try {
// //       await OneSignal.User.PushSubscription.optOut();
// //       setIsSubscribed(false);
// //       console.log("❌ Unsubscribed");
// //     } catch (err) {
// //       console.error("Unsubscribe failed", err);
// //     }
// //   };

// //   function pushSubscriptionChangeListener(event) {
// //     console.log("event.previous.id", event.previous.id);
// //     console.log("event.current.id", event.current.id);
// //     console.log("event.previous.token", event.previous.token);
// //     console.log("event.current.token", event.current.token);
// //     console.log("event.previous.optedIn", event.previous.optedIn);
// //     console.log("event.current.optedIn", event.current.optedIn);
// //   }

// //   OneSignal.User.PushSubscription.addEventListener(
// //     "change",
// //     pushSubscriptionChangeListener
// //   );

// //   return (
// //     <div className="p-6 space-y-4">
// //       <h1 className="text-2xl font-bold">Test Notification Subscribe</h1>

// //       {loading ? (
// //         <p>Loading...</p>
// //       ) : isSubscribed ? (
// //         <button
// //           onClick={handleUnsubscribe}
// //           className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
// //         >
// //           ❌ Unsubscribe Notification
// //         </button>
// //       ) : (
// //         <button
// //           onClick={handleSubscribe}
// //           className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
// //         >
// //           🔔 Subscribe Notification
// //         </button>
// //       )}
// //     </div>
// //   );
// // };

// // export default Test;

// import React, { useEffect, useState, useMemo, useRef } from "react";
// import { GetGuestPersenceLogs } from "@/api/persence";
// import { groupEventsByRoomAndType } from "@/utilities/helpers";
// import { client } from "@/constant/wsCommand";
// const token =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjAxLCJ1c2VybmFtZSI6ImJpcmQiLCJlbWFpbCI6ImJpcmRAYXJjaGkuY29tIiwiZnVsbF9uYW1lIjoiS3JpdHRpbiBLbGluaG9tIiwicm9sZV9pZCI6MywiaXNfYWN0aXZlIjoxLCJpbWdfcHJvZmlsZSI6InN0YXJ0ZXJfcHJvZmlsZS5qcGciLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTc1MjgxMzYzMSwiZXhwIjoxNzUyOTAwMDMxfQ.8CQ5en7n8NXz8ysHmLcCg-p9LBQVgNsJ6qnxGYfvj8g";
// const Test = () => {
//   const [data, setData] = useState([]);
//   const [isWsReady, setIsWsReady] = useState(false);
//   const ws = useRef(null);

//   const fetchData = async () => {
//     try {
//       const response = await GetGuestPersenceLogs(token);
//       setData(response?.data || []);
//       console.log(response?.data);
//       // setData(groupEventsByRoomAndType(response?.data) || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   useEffect(() => {
//     ws.current = new WebSocket(import.meta.env.VITE_WS_URL);

//     ws.current.onopen = () => {
//       console.log("WebSocket Connected");
//       setIsWsReady(true);
//     };

//     ws.current.onmessage = (event) => {
//       const msg = JSON.parse(event.data);
//       handleCommand(msg);
//     };

//     ws.current.onerror = (error) => {
//       console.error("WebSocket Error:", error);
//     };

//     ws.current.onclose = () => {
//       // console.log('WebSocket Disconnected');
//       setIsWsReady(false);
//     };

//     return () => {
//       ws.current.close();
//     };
//   }, [token]);

//   useEffect(() => {
//     if (isWsReady && token) {
//       sendWebSocketMessage({ cmd: client.LOGIN, param: { token } });
//     }
//   }, [isWsReady, token]);

//   const sendWebSocketMessage = (message) => {
//     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//       ws.current.send(JSON.stringify(message));
//     } else {
//       // console.warn('WebSocket not open, retrying...');
//       setTimeout(() => sendWebSocketMessage(message), 500);
//     }
//   };

//   const handleCommand = (msg) => {
//     const { cmd, param } = msg;

//     switch (cmd) {
//       case client.LOGIN:
//         if (param.status == "success") {
//           console.log("Login success");
//         }
//         break;

//       case 999:
//         if (param) {
//           const newData = param;
//           setData((prev) => {
//             const exists = prev.find((t) => t.id == newData.id);
//             if (exists) return prev;
//             return [newData, ...prev];
//           });
//         }
//         break;

//       // case 999:
//       //   if (param) {
//       //     setData((prev) => {
//       //       const flat = [...prev.flatMap((g) => g.events), param];
//       //       return groupEventsByRoomAndType(flat);
//       //     });
//       //   }
//       //   break;

//       default:
//         break;
//     }
//   };

//   return (
//     <div>
//       {groupEventsByRoomAndType(data).map((item, index) => (
//         <div key={index} className="p-2 border-b">
//           <strong>{index + 1}. </strong>
//           <strong>Room {item.room_id}</strong> — {item.event} ON:{" "}
//           <span className="text-green-700">{item.time_on}</span> → OFF:{" "}
//           <span className="text-red-700">{item.time_off}</span>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Test;

import React from "react";

const Test = () => {
  return <div>Test</div>;
};

export default Test;
