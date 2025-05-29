'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthContext } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import React, { useContext, useEffect, useState } from 'react';
import { ASSISTANT } from '../../ai-assistants/page';
import Image from 'next/image';
import { useAssistant } from '@/context/AssistantContext';

function AssistantList() {
  const { user } = useContext(AuthContext);
  const convex = useConvex();
  const [assistantList, setAssistantList] = useState<ASSISTANT[]>([]);
  const { assistant, setAssistant } = useAssistant();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      GetUserAssistants();
    }
  }, [user]);

  const GetUserAssistants = async () => {
    try {
      const result = await convex.query(api.UserAiAssistants.GetAllUserAssistants, {
        uid: user._id,
      });

      if (result && result.length > 0) {
        setAssistantList(result);
      }
    } catch (error) {
      console.error('Error fetching user assistants:', error);
    }
  };

  const filteredAssistants = assistantList.filter(assistant => 
    assistant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assistant.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-5 bg-secondary border-2-[1px] h-screen relative">
      <h2 className="font-bold text-lg">Your Personal AI Assistants</h2>
      <Button className="w-full mt-3">+ Add New Assistant</Button>
      <Input 
        className="bg-white mt-4" 
        placeholder="Search assistants..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="mt-5">
        {filteredAssistants.length > 0 ? (
          <>
            <h3 className="text-sm text-gray-600 mb-2">Click to activate:</h3>
            {filteredAssistants.map((assistant_, index) => (
              <div
                className={`p-2 flex gap-3 items-center hover:bg-gray-200 hover:dark:bg-slate-700 rounded-xl cursor-pointer mt-2
                  ${assistant_?.id === assistant?.id ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 border-2' : 'bg-gray-50 dark:bg-gray-800'}
                  `}
                key={index}
                onClick={() => setAssistant(assistant_)}
              >
                <Image
                  src={assistant_.image}
                  alt={assistant_.name}
                  width={60}
                  height={60}
                  className="rounded-lg w-[60px] h-[60px] object-cover"
                />
                <div className="flex-1">
                  <h2 className="font-bold">{assistant_.name}</h2>
                  <h2 className="text-gray-600 text-sm dark:text-gray-400">
                    {assistant_.title}
                  </h2>
                </div>
                {assistant_?.id === assistant?.id && (
                  <div className="text-blue-600 font-semibold text-sm">
                    ✓ Active
                  </div>
                )}
              </div>
            ))}

            {/* Show currently active assistant */}
            {assistant && (
              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Currently Active:
                </h3>
                <div className="flex gap-3 items-center">
                  <Image
                    src={assistant.image}
                    alt={assistant.name}
                    width={40}
                    height={40}
                    className="rounded-lg w-[40px] h-[40px] object-cover"
                  />
                  <div>
                    <h2 className="font-bold text-blue-900 dark:text-blue-100">
                      {assistant.name}
                    </h2>
                    <h2 className="text-blue-700 text-sm dark:text-blue-300">
                      {assistant.title}
                    </h2>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            <p>No AI assistants found.</p>
            <p className="text-sm">
              {searchQuery ? 'Try a different search term.' : 'Please go back and select some assistants.'}
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-10 flex gap-3 items-center hover:bg-gray-200 w-[87%] p-2 rounded-xl cursor-pointer">
        <Image
          src={user?.picture}
          alt="user"
          width={35}
          height={35}
          className="rounded-full"
        />
        <div>
          <h2 className="font-bold">{user?.name}</h2>
          <h2 className="text-gray-400">
            {user?.orderId ? 'Pro Plan' : 'Free Plan'}
          </h2>
        </div>
      </div>
    </div>
  );
}

export default AssistantList;
