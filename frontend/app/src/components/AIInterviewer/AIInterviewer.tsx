import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, useAnimations, OrbitControls, Center, Bounds } from '@react-three/drei';
import interviewerModelUrl from '../../assets/3dModels/interviewer.glb?url';

interface AIInterviewerProps {
  projectId: string;
  user: {
    sub: string;
    name?: string;
  } | null;
}

function Interviewer3DModel() {
  // Commenting out the GLB load to test WebGL context crash
  // const { scene, animations } = useGLTF(interviewerModelUrl);
  // const { actions, names } = useAnimations(animations, scene);
  // useEffect(() => {
  //   if (names.length > 0) {
  //     actions[names[0]]?.reset().fadeIn(0.5).play();
  //   }
  // }, [actions, names]);
  // return <primitive object={scene} />;

  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

// Preload the model
// useGLTF.preload(interviewerModelUrl);

export function AIInterviewer({ projectId, user }: AIInterviewerProps) {
  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-sm text-neutral-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#09090b]">
      {/* 3D Interviewer View */}
      <div className="relative w-full h-64 border-b border-zinc-800/50 bg-zinc-950/30 overflow-hidden shrink-0">
        <Suspense fallback={
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[12px] text-zinc-500 font-medium">
            <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin"></div>
            Loading Interviewer...
          </div>
        }>
          <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} />
            {/* <Environment preset="city" /> */}
            <Bounds fit clip margin={1.5}>
              <Center>
                <Interviewer3DModel />
              </Center>
            </Bounds>
            <OrbitControls 
              enableZoom={true} 
              enablePan={true} 
              minPolarAngle={Math.PI / 4} 
              maxPolarAngle={Math.PI / 1.5} 
            />
          </Canvas>
        </Suspense>
        
        {/* Name Badge */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2.5 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800/80 shadow-sm">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
          <div>
            <div className="text-[12px] font-medium text-zinc-200 leading-tight">Sarah</div>
            <div className="text-[10px] text-zinc-400 leading-tight">AI Trainer</div>
          </div>
        </div>
      </div>

      {/* Transcript Chatbox */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 ml-1">
            <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">Sarah</span>
          </div>
          <div className="bg-zinc-900/40 text-zinc-300 text-[13px] px-4 py-3 rounded-xl rounded-tl-sm w-[92%] border border-zinc-800/40 leading-[1.65]">
            Hello! I'm Sarah, your AI interviewer. Let's start with the "Breakfast" problem. Are you familiar with topological sort?
          </div>
        </div>

        <div className="flex flex-col gap-1.5 items-end">
          <div className="flex items-center gap-2 mr-1">
            <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">You</span>
          </div>
          <div className="bg-zinc-800 text-zinc-100 text-[13px] px-4 py-3 rounded-xl rounded-tr-sm w-[92%] border border-zinc-700/50 leading-[1.65] shadow-sm">
            Yes, I think we can use a min-heap to get the lexicographically smallest order.
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 ml-1">
            <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">Sarah</span>
          </div>
          <div className="bg-zinc-900/40 text-zinc-300 text-[13px] px-4 py-3 rounded-xl rounded-tl-sm w-[92%] border border-zinc-800/40 leading-[1.65]">
            That's a great approach. Can you explain how you'll initialize the indegrees for the components before adding them to the heap?
          </div>
        </div>
      </div>

      {/* Active Recording Indicator */}
      <div className="shrink-0 p-4 border-t border-zinc-800/50 bg-zinc-950/40">
        <div className="flex items-center bg-[#121214] border border-zinc-800/60 rounded-lg px-4 py-2.5">
          <div className="w-2 h-2 rounded-full bg-zinc-300 animate-pulse mr-3"></div>
          <span className="text-[12px] text-zinc-500 flex-1 font-medium tracking-wide">Listening...</span>
        </div>
      </div>
    </div>
  );
}
