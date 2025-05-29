'use client';

import { BlurFade } from '@/components/magicui/blur-fade';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthContext } from '@/context/AuthContext';
import { api } from '@/convex/_generated/api';
import AiAssistantsList from '@/services/AiAssistantsList';
import { useConvex, useMutation } from 'convex/react';
import { Loader2Icon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';

export type ASSISTANT = {
  id: number;
  name: string;
  title: string;
  image: string;
  instruction: string;
  userInstruction: string;
  sampleQuestions: string[];
};

function AIAssistant() {
  const [selectedAssistant, setSelectedAssistant] = useState<ASSISTANT[]>([]);
  const insertAssistants = useMutation(api.UserAiAssistants.InsertSelectedAssistants);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const convex = useConvex();
  const router = useRouter();
  const searchParams = useSearchParams();
  const allowReselect = searchParams.get('reselect');

  useEffect(() => {
    if (user) {
      GetUserAssistants();
    }
  }, [user]);

  const GetUserAssistants = async () => {
    if (!user?._id) return;
    
    try {
      const result = await convex.query(api.UserAiAssistants.GetAllUserAssistants, {
        uid: user._id,
      });

      if (result && result.length > 0 && !allowReselect) {
        setSelectedAssistant(result);
        router.push('/workspace');
      }
    } catch (error) {
      console.error('Error fetching assistants:', error);
    }
  };

  const onSelect = (assistant: ASSISTANT) => {
    const item = selectedAssistant.find((item: ASSISTANT) => item.id === assistant.id);

    if (item) {
      setSelectedAssistant(prev => prev.filter((item: ASSISTANT) => item.id !== assistant.id));
    } else {
      setSelectedAssistant(prev => [...prev, assistant]);
    }
  };

  const IsAssistantSelected = (assistant: ASSISTANT) => {
    return selectedAssistant.some((item: ASSISTANT) => item.id === assistant.id);
  };

  const clearSelection = () => {
    setSelectedAssistant([]);
  };

  const OnCLickContinue = async () => {
    if (selectedAssistant.length === 0) {
      return;
    }

    setLoading(true);
    try {
      await insertAssistants({
        records: selectedAssistant,
        uid: user?._id,
      });

      router.push('/workspace');
    } catch (error) {
      console.error('Error saving assistants:', error);
      setLoading(false);
    }
  };

  return (
    <div className="px-10 mt-20 md:px-28 lg:px-36 xl:px-48">
      <div className="flex justify-between items-center">
        <div>
          <BlurFade delay={0.25} inView>
            <h2 className="text-3xl font-bold">
              Welcome to World of AI Assistants 🤖
            </h2>
          </BlurFade>
          <BlurFade delay={0.25 * 2} inView>
            <p className="text-xl mt-2">
              Choose your AI Companions to Simplify Your Tasks 🚀
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Please select at least one assistant to continue
            </p>
          </BlurFade>
        </div>
        <div className="flex gap-2">
          {selectedAssistant.length > 0 && (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={clearSelection}
            >
              <Trash2 className="w-4 h-4" />
              Clear Selection
            </Button>
          )}
          <RainbowButton
            disabled={selectedAssistant.length === 0}
            onClick={OnCLickContinue}
          >
            {loading && <Loader2Icon className="animate-spin mr-2" />}
            Continue ({selectedAssistant.length} selected)
          </RainbowButton>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-5">
        {AiAssistantsList.map((assistant, index) => (
          <BlurFade key={assistant.id} delay={0.25 + index * 0.05} inView>
            <div
              className={`border p-3 rounded-xl hover:scale-105 transition-all ease-in-out cursor-pointer relative
                ${IsAssistantSelected(assistant) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:border-gray-300'}
              `}
              onClick={() => onSelect(assistant)}
            >
              <Checkbox
                className="absolute m-2"
                checked={IsAssistantSelected(assistant)}
              />
              <Image
                src={assistant.image}
                alt={assistant.title}
                width={600}
                height={600}
                className="rounded-xl w-full h-[200px] object-cover"
              />
              <h2 className="text-center font-bold text-lg mt-2">
                {assistant.name}
              </h2>
              <h2 className="text-center text-gray-600 dark:text-gray-400">
                {assistant.title}
              </h2>
            </div>
          </BlurFade>
        ))}
      </div>
    </div>
  );
}

export default AIAssistant;
