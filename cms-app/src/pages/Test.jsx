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
  return (
    <p>
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Delectus quae
      sequi aspernatur sunt voluptates, perspiciatis, atque culpa numquam aut
      error est necessitatibus, nulla iure dolore officiis ratione veritatis
      dolores dolorem. Vitae quae laborum porro beatae explicabo sed praesentium
      esse, autem cumque libero minus quibusdam nam. Accusamus fugiat obcaecati
      eos quam libero, quisquam nostrum earum assumenda quaerat quidem ullam
      culpa molestias! Ducimus laborum tenetur quaerat maiores at pariatur
      quisquam magni earum sequi in, neque suscipit debitis qui nihil
      exercitationem quos blanditiis magnam. Corporis fugit laborum sunt aperiam
      ab officiis quam. Illo? Nihil quas earum repellendus temporibus cum
      exercitationem, suscipit odio eos aliquam consequuntur est officia
      veritatis provident repudiandae rem doloribus porro, consequatur
      dignissimos. Similique, nulla. Facilis asperiores facere quas maxime
      eveniet. Rerum optio itaque, hic dolore cumque est consequatur quia soluta
      voluptatibus quaerat odit laudantium porro enim et voluptas praesentium
      aperiam accusantium earum blanditiis non saepe debitis deserunt vel.
      Velit, quae! Saepe deserunt corrupti rem repudiandae nihil mollitia minima
      nesciunt, reiciendis id quo ipsa enim repellat cumque vitae facilis
      dolorem aliquam doloremque sed laudantium laboriosam earum accusantium
      porro quidem? Corporis, voluptatibus. Magni maiores in saepe assumenda,
      hic, commodi fugiat reiciendis quo, vitae itaque veritatis nostrum facilis
      eos debitis minus odit consequatur maxime officia. Sint asperiores libero
      hic tenetur voluptatem! Animi, fugiat. Possimus explicabo minima dolor
      nesciunt voluptate aliquid deleniti! Ratione dolores sed maiores,
      quisquam, soluta corporis molestiae hic totam dicta quasi laudantium
      quaerat pariatur nemo commodi perspiciatis neque ipsum nam beatae?
      Voluptatum ut quod cumque? Nisi fuga dolorum sit vero veniam eaque
      similique corrupti nihil, perspiciatis accusamus sint aut esse id?
      Officiis voluptatem aut, aliquid animi saepe esse quisquam sed nemo? Illum
      distinctio perferendis tenetur corrupti qui facere molestiae recusandae
      assumenda, provident perspiciatis laudantium eius cum natus vitae veniam!
      Eum aut blanditiis ea corrupti repellat porro perspiciatis quibusdam
      libero quis quaerat. Hic, error. Esse, debitis nesciunt perspiciatis vero
      repellendus ratione maxime sequi. Veniam perspiciatis consectetur minima
      voluptatum tempore obcaecati facilis reprehenderit quibusdam alias earum
      nesciunt vel officia, ipsa ipsum exercitationem corporis. Velit magni
      possimus ut aliquid sint? Recusandae tempora ab numquam vel cumque ex,
      expedita blanditiis ipsum placeat consectetur libero reprehenderit
      repellat exercitationem at optio eius rem aliquid perspiciatis et dolorem?
      Id dicta quas asperiores facilis deserunt nesciunt quidem incidunt unde
      similique? Iure natus, aliquam at illo nulla, officia maiores sit optio
      distinctio vero laboriosam odit eum aut atque? A, laborum? Repudiandae
      accusamus, sint numquam optio iure voluptatibus! Odit commodi, suscipit
      aperiam ut quae necessitatibus aspernatur voluptates aut quaerat iste
      ratione magnam enim tenetur expedita, temporibus laudantium hic voluptas
      possimus? Minus? Quos doloremque fugiat, nobis necessitatibus ipsa sunt
      quasi minima eligendi, fugit et ab, quas reiciendis consectetur
      accusantium cumque perferendis consequuntur exercitationem odio deleniti.
      Consequuntur cupiditate amet unde nobis deserunt mollitia. Iusto voluptate
      vero a aliquam perferendis dignissimos laudantium. Similique ratione dicta
      pariatur. Repudiandae optio non incidunt maiores consequatur, voluptatibus
      mollitia harum fugiat laudantium quas enim doloremque recusandae? Ipsam,
      ea obcaecati. Aliquam quo aspernatur esse ad accusamus culpa, officia
      necessitatibus ea nulla fugiat veniam quis, vel, inventore nihil impedit
      corporis asperiores eveniet omnis nostrum amet sed provident et alias.
      Consequuntur, accusamus. A quasi architecto dignissimos expedita accusamus
      natus iste sed aperiam, veniam suscipit odit distinctio ut commodi beatae
      amet quam sit. Unde cupiditate eveniet enim ut deserunt corporis ad veniam
      officia? Consectetur, quisquam? Aliquam error voluptatum architecto
      excepturi, omnis sint saepe rem quo magnam natus ea harum iste, eligendi
      libero, dicta cumque necessitatibus? Praesentium quibusdam dolores
      pariatur minus sed culpa vel. Quo nemo repellendus quod libero sapiente
      voluptates cumque blanditiis beatae ratione delectus quidem odit fugiat
      earum veniam, sequi eligendi, corrupti adipisci tempore dignissimos hic
      sit ullam! Similique dignissimos culpa modi. Sint fuga quis ex, dolor
      libero incidunt? Dolorum, distinctio unde? Incidunt est debitis ipsum
      perferendis possimus expedita! Odit inventore quibusdam officiis maiores,
      voluptatem fugit, magni esse ipsum, rerum eius nihil! Tempora rerum quos
      velit, minus vitae soluta quae unde non earum minima qui consectetur.
      Pariatur eaque laborum maiores nostrum delectus ad quisquam. Perferendis
      error culpa voluptates maxime at, nesciunt doloremque? Id ipsa tempore
      nulla expedita, porro voluptate fugit aspernatur assumenda reiciendis,
      praesentium ex ipsum perferendis at, odit esse voluptates harum dolorum
      nam ab atque architecto cupiditate illo omnis. Aut, consequuntur. Quis
      placeat nisi eligendi voluptates incidunt ipsa aliquam, natus culpa qui
      nemo iure iusto laudantium repellendus provident architecto veniam illo
      assumenda dolorem ullam! Sunt, unde quo. Fuga corporis quibusdam nobis.
      Voluptatem aut aliquid sed inventore reprehenderit quam sint tempore
      impedit cupiditate, libero soluta iste similique id rem praesentium eaque
      accusantium assumenda error beatae ex, in saepe! Dolore tempora a
      veritatis? Officiis perspiciatis eaque nam, illum ducimus doloremque
      dolorum eligendi temporibus aliquid libero possimus mollitia delectus
      nesciunt recusandae ipsa laborum totam amet eos optio voluptatibus enim
      doloribus perferendis! Velit, at repellat. Deserunt minima perspiciatis ad
      accusantium assumenda. Aperiam, in? Laboriosam harum dolores doloremque.
      Voluptates repellendus iure velit quasi numquam error, laudantium
      repellat, eligendi ad aspernatur similique tempora a? Corporis, tenetur
      excepturi. Cupiditate quis quae expedita provident, maxime autem corrupti
      iusto, facilis aut placeat voluptas eligendi tempora. Natus aut beatae rem
      autem saepe possimus, sit dolore ut quaerat temporibus tempore modi vero.
      Exercitationem distinctio ducimus magnam commodi, fugiat repellendus
      itaque corporis, officia porro explicabo, beatae quod sint. Blanditiis
      eaque hic ipsa tenetur ab. Magni commodi doloribus natus itaque, est nulla
      laborum minus? Possimus quia blanditiis veniam quos voluptate porro rerum?
      Quae dolorem ratione odit natus officia inventore tenetur ducimus.
      Provident hic accusamus architecto? Exercitationem porro quae blanditiis
      aut reiciendis itaque, magnam dolorem. Molestiae dolore voluptas, nostrum
      tempora, porro, facilis explicabo adipisci quibusdam reprehenderit iusto
      cumque aliquam possimus delectus corporis! Reiciendis deleniti eius non.
      Itaque dolorem sunt ea quaerat hic cupiditate esse assumenda? Minus quae
      sed pariatur debitis optio necessitatibus. Repellat sit eligendi,
      inventore excepturi explicabo cumque sequi, in sint corrupti ducimus harum
      assumenda autem quae eaque facere ullam doloribus commodi, vel
      voluptatibus. Accusantium unde corporis, eum ipsum mollitia ex nostrum
      earum soluta, magnam aliquam illo voluptatibus amet numquam quo laboriosam
      itaque possimus porro magni id distinctio voluptas libero. Recusandae
      officia officiis quis. Neque mollitia debitis inventore, maxime itaque
      error enim. Adipisci magni excepturi soluta debitis necessitatibus autem
      error nesciunt praesentium sed est, fugit quidem optio beatae alias fugiat
      cum dolores voluptatibus amet? Dolor, culpa. Vero in, nemo repellat quasi
      quibusdam consequatur impedit, cumque cum voluptatibus consectetur
      voluptatem eaque, dicta quod eius nobis quia. Maxime ex ea doloremque
      totam autem, magnam incidunt nisi. Eos aut officia et sed! Adipisci
      perspiciatis ratione atque, corporis architecto quia ullam fugit neque
      minus quam nobis repellat facilis possimus libero accusantium soluta quas
      mollitia sapiente. Non, illum distinctio. Fugit modi omnis cum dolores
      delectus? Neque commodi ex illo minima delectus consequatur ratione
      ducimus ipsum explicabo? Dolore, porro, consequatur nesciunt similique
      totam iure omnis officia laudantium ex nihil eum? Et laudantium illum
      corrupti consequatur sed, deleniti ipsum dolores dolorum. Molestias
      blanditiis, aut voluptatum repellendus nam distinctio asperiores eos
      laudantium quis ipsum neque mollitia fuga debitis culpa libero eum
      eligendi! Voluptates velit itaque, explicabo illo laudantium expedita unde
      aut quo fuga dolor rerum nam nostrum soluta voluptatibus natus nihil
      debitis ipsam officiis dolore! Eaque praesentium sequi nam ex maiores rem?
      Voluptate, porro aliquam! Debitis fugit molestias distinctio perspiciatis
      tempora adipisci hic earum, voluptatibus laudantium porro optio itaque ea
      enim, neque reiciendis qui harum eos eius in. Consequatur facere vel
      alias! Veniam veritatis quo, dolorem eos autem laudantium mollitia facilis
      ut! Vel ipsum ex numquam at? Eum ea exercitationem odio quo modi, pariatur
      dignissimos laborum sed! Dicta consequatur in nam maxime. Fugit rem autem
      similique accusantium modi. Perspiciatis placeat quas, quibusdam mollitia
      recusandae at, saepe animi alias veniam porro assumenda quis. Mollitia
      temporibus perspiciatis dolor facilis itaque amet deleniti minus ipsa.
      Porro alias atque sit quisquam nam esse. Illo quidem praesentium enim
      cupiditate reiciendis minus beatae numquam velit perspiciatis, amet
      deleniti sed ipsam, accusamus fugiat dolores vitae facere voluptatum
      molestiae consequatur. Error consequuntur exercitationem amet minima.
      Velit, possimus accusantium atque architecto iure neque tempora culpa quas
      excepturi itaque debitis ducimus ipsam facere saepe corrupti rem impedit
      quasi at ut modi soluta! Enim, dicta? Voluptate eaque temporibus
      reiciendis iusto esse reprehenderit veritatis nisi. Minus alias, dolores
      ducimus illum incidunt harum temporibus sit inventore deserunt autem quo
      sapiente saepe sint similique esse blanditiis. Nulla explicabo ipsam nam
      architecto vel debitis quod voluptas? Omnis consequatur repudiandae,
      ducimus veritatis fugit vero accusamus sint recusandae excepturi beatae
      veniam velit harum. Facere quisquam asperiores voluptates velit corporis?
      Sint dolor explicabo ipsa minus voluptate expedita dignissimos
      voluptatibus ab mollitia. Necessitatibus doloremque est fugit voluptatem
      illum exercitationem quam nobis inventore fugiat neque modi debitis
      architecto, porro tenetur? Harum, vero. Quibusdam voluptatibus obcaecati
      eligendi distinctio unde modi! Aperiam, consequatur expedita quas vel nisi
      adipisci necessitatibus voluptatibus velit. Voluptas aspernatur culpa
      doloremque, delectus cumque quod deserunt ad, aliquid, inventore maxime
      dolore? Velit quis, nulla maiores rerum molestiae architecto
      necessitatibus repudiandae neque. Ab tenetur voluptate rerum aliquam?
      Molestias pariatur exercitationem rerum, distinctio doloremque quo ducimus
      commodi? Nam odit deserunt expedita quidem illum? Quidem officia officiis
      ad! Praesentium eos cumque expedita asperiores aut molestiae quas quidem
      veniam debitis repellat, iste eveniet eaque recusandae quos provident
      ipsum rerum, sed totam voluptatibus minus quia? Error?
    </p>
  );
};

export default Test;
