import React from 'react'
import { ChatStore } from '../store/ChatStore'
import { GroupStore } from '../store/GroupStore'
import NoChatSelect from '../components/NoChatSelect'
import Chatbox from '../components/Chatbox'
import GroupChatbox from '../components/GroupChatbox'
import Sidebar from '../components/Sidebar'

const HomePage = () => {
  const { selectedUser } = ChatStore()
  const { selectedGroup } = GroupStore()

  const hasChatOpen = selectedUser || selectedGroup

  const renderChatArea = () => {
    if (selectedUser) {
      return <Chatbox />
    }
    if (selectedGroup) {
      return <GroupChatbox />
    }
    return <NoChatSelect />
  }

  return (
    <div className='h-screen bg-base-200/50'>
      {/* Full viewport layout — mobile: edge-to-edge, desktop: centered card */}
      <div className='flex items-center justify-center pt-14 sm:pt-16 md:pt-[4.5rem] px-0 md:px-4'>
        <div className='bg-base-100 rounded-none md:rounded-2xl shadow-xl shadow-base-content/5 border-0 md:border md:border-base-200/80 w-full max-w-6xl h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] md:h-[calc(100vh-5.5rem)]'>
          <div className='flex h-full rounded-none md:rounded-2xl overflow-hidden'>
            {/* Sidebar: full width on mobile when no chat, hidden on mobile when chat open */}
            <div className={`${hasChatOpen ? 'hidden md:flex' : 'flex'} h-full w-full md:w-auto flex-shrink-0`}>
              <Sidebar />
            </div>
            {/* Chat area: full width on mobile when chat open, hidden on mobile when no chat */}
            <div className={`${hasChatOpen ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 h-full`}>
              {renderChatArea()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
