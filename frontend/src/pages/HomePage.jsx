import React from 'react'
import { ChatStore } from '../store/ChatStore'
import NoChatSelect from '../components/NoChatSelect'
import Chatbox from '../components/Chatbox'
import Sidebar from '../components/Sidebar'

const HomePage = () => {
  const {selectedUser}=ChatStore()
  return (
    <div className='h-screen bg-base-200'>
        <div className='flex items-center justify-center pt-20 px-4'>
            <div className='bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]'>
              <div className='flex h-full rounded-lg overflow-hidden'>

                    <Sidebar />
                    {!selectedUser ? <NoChatSelect /> : <Chatbox />}
              </div>

            </div>
        </div>
    </div>
  )
}

export default HomePage