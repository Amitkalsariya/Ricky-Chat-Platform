// import { MessageSquare } from 'lucide-react'
// import React from 'react'

// const NoChatSelect = () => {
//   return (
//     <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
//       <div className="max-w-md text-center space-y-6">
//         {/* Icon Display */}
//         <div className="flex justify-center gap-4 mb-4">
//           <div className="relative">
//             <div
//               className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
//              justify-center animate-bounce"
//             >
//               <MessageSquare className="w-8 h-8 text-primary " />
//             </div>
//           </div> 
//         </div>

//         {/* Welcome Text */}
//         <h2 className="text-2xl font-bold">Welcome to Ricky!</h2>
//         <p className="text-base-content/60">
//           Select a conversation from the sidebar to start chatting
//         </p>
//       </div>
//     </div>
//   )
// }

// export default NoChatSelect

import React from 'react';
import Lottie from 'lottie-react';
import groovyWalkAnimation from '../components/assets/groovyWalkAnimation.json';  // Ensure the path is correct

const NoChatSelect = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Lottie Animation Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            {/* Removed the box styling and added larger size */}
            <Lottie 
              animationData={groovyWalkAnimation}  // Use the Lottie animation
              loop={true}  // Loop the animation
              autoplay={true}  // Autoplay the animation
              className="w-32 h-32"  // Set a larger size for the animation
            />
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to Ricky!</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelect;
