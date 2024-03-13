'use client'
import { UseChatHelpers } from 'ai/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from './ui/input'
import { Label } from "@/components/ui/label"
import { useState, useTransition } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Checkbox } from "@/components/ui/checkbox"
import { IconSpinner, IconTrash,IconSeparator } from '@/components/ui/icons'
import { Textarea } from "@/components/ui/textarea"
import { IconEdit,IconPlus } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import { ExternalLink } from '@/components/external-link'
import { toast } from 'react-hot-toast'

function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

interface Agent {
  id: string;
  name: string;
  prompt: string;
  usetool?: boolean
}

function getAgentsText(){
  const storedAgents = localStorage.getItem('Agents');
    if (storedAgents) {
      return storedAgents
    }else{return null}
}

export default function Agents({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  const newAgent = `{"#666666":{"name":"Search","prompt":"Get Info from Internet","usetool":true},"#666777":{"name":"CoT","prompt":"Let's think step by step."}}`
  const router=useRouter()
  const [agentsText, setAgentsText] = useState(getAgentsText());
  const [editorOpen, setEditorOpen] = useState(false)
  const [allAgentEditorOpen, setallAgentEditorOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isRemovePending, startRemoveTransition] = useTransition()
  const [currentAgent, setCurrentAgent] = useState({ id: '', name: '', prompt: '' })
  const [agents, setAgents] = useState(() => {
    const atext=getAgentsText()
    if (atext) {
      return JSON.parse(atext);
    } else {
      localStorage.setItem('Agents', newAgent);
      return JSON.parse(newAgent); // or you can return an empty object {} if that's the desired initial state
    }
  });
  const [usetool, setUsetool] = useState(false) // Load agents from localStorage or initialize as an empty object

  // Function to open the editor with the selected agent's details
  const handleEditAgent = (agentId:string) => {
    setCurrentAgent({ ...agents[agentId], id: agentId })
    setEditorOpen(true)
    if(agents[agentId].usetool){
      setUsetool(true)
    }else{
      setUsetool(false)
    }
  }

  // Function to handle saving the current agent to the local state and localStorage
  const handleSaveAgents = () => {
    const updatedAgents = {
      ...agents,
      [currentAgent.id]: { name: currentAgent.name, prompt:currentAgent.prompt,usetool:usetool }
    }
    setAgents(updatedAgents)
    localStorage.setItem('Agents', JSON.stringify(updatedAgents)) // Save to localStorage
    setEditorOpen(false) // Close the editor
    router.replace('/')
    router.refresh()
  }

  // Function to open the editor for creating a new agent
  const handleNewAgent = () => {
    setCurrentAgent({ id: getRandomColor(), name: '', prompt: '' })
    setEditorOpen(true)
  }

  return (
    <>
    <div className='w-full flex justify-end'>
    <Button variant={"link"} className='text-xs text-muted-foreground' onClick={()=>{navigator.clipboard.writeText(localStorage.getItem('Agents')||''); toast.success('Agents data is copied to clipboard')}}>Export</Button>
    <IconSeparator className='my-2'/><Button className='text-xs text-muted-foreground' variant={"link"} onClick={()=>{setAgentsText(getAgentsText());setallAgentEditorOpen(true)}}>Import</Button>
    </div>
    <div className="flex flex-wrap gap-4 mx-4 justify-center">
      {Object.entries(agents).map(([key, agent]) => (
        <>
        <Card key={key} className="w-[300px] h-[180px]">
          <CardHeader>
            <CardTitle>{(agent as Agent).name} {(agent as Agent).usetool&&<span className="text-xs text-muted-foreground"> usetool</span>}
            </CardTitle>
            <CardDescription className='h-[42px]'>{(agent as Agent).prompt.slice(0,70)+' ...'}</CardDescription>
          </CardHeader>
          <CardFooter className="flex gap-2">
            <Button onClick={() => handleEditAgent(key)}><IconEdit/></Button>
            <Button
              variant="ghost"
              className="ml-auto size-6 p-0 hover:bg-background"
              disabled={isRemovePending}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <IconTrash />
              <span className="sr-only">Delete</span>
            </Button>
          </CardFooter>
        </Card>
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your chat message and remove your
                    data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isRemovePending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isRemovePending}
                    onClick={() => {
                      const updatedAgents = { ...agents }
                      delete updatedAgents[key] // Remove the agent from the object
                      setAgents(updatedAgents) // Update local state
                      localStorage.setItem('Agents', JSON.stringify(updatedAgents)) // Update localStorage
                    }
                  }
                  >
                    {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            </>
      ))}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <div className="grid grid-cols-5 items-center gap-2">
              <Label htmlFor="name" className="text-right">
                * Name
              </Label>
              <Input className="col-span-4"
                value={currentAgent.name}
                placeholder="Input an Agent Name"
                onChange={(e) => {
                  const newName = e.target.value;
                  // const usernamePattern = /^[A-Za-z][A-Za-z0-9_-]{2,15}$/;
                  // if (usernamePattern.test(newName)) {
                  setCurrentAgent({ ...currentAgent, name: newName });
                  // }
                }}
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-2">
              <Label htmlFor="name" className="text-right">
                Prompt
              </Label>
              <Textarea className="col-span-4 h-[200px]"
                value={currentAgent.prompt}
                placeholder="Agent System Role Prompt"
                onChange={(e) => setCurrentAgent({ ...currentAgent, prompt: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="items-center">
          <Checkbox id="usetool" checked={usetool} onCheckedChange={()=>setUsetool(!usetool)}/>
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Use Tools
            </label>
            <Button onClick={handleSaveAgents}>Save Agent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={allAgentEditorOpen} onOpenChange={setallAgentEditorOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Import Agents</DialogTitle>
          </DialogHeader>
          <Textarea className="col-span-4 h-[200px]"
                value={agentsText||''}
                onChange={(e)=>{setAgentsText(e.target.value)}}
          />
            <Button onClick={()=>{localStorage.setItem('Agents',agentsText||getAgentsText()||'');window.location.reload()}}>Save Agents</Button>
            <Button variant="outline" onClick={()=>setAgentsText(newAgent)}>Reset to Default</Button>
          </DialogContent>
      </Dialog>
      <Card className="w-[300px] h-[180px] text-center">
        <button className="mt-20" onClick={handleNewAgent}>+ New Agent</button>
      </Card>
    </div>
     <div className="mx-auto px-4 text-center mt-12">
       <p className="mb-2 leading-normal text-muted-foreground">
         This is an open source AI app built with{' '}
         <ExternalLink href="https://nextjs.org">▲ Next.js</ExternalLink> and{' '}
         <ExternalLink href="https://js.langchain.com/docs">
          LangChain.js 🦜🔗
         </ExternalLink>
         .
       </p>
       <p className="leading-normal text-muted-foreground">
         You can add your own agents and use '@' to mention them for conversation.
       </p>
       <p className="leading-normal text-muted-foreground mt-2">
         if agents are not updated after editting, please try <Button variant={"outline"} onClick={() => window.location.reload()}>Reload Page</Button>
       </p>
   </div>
   </>
  )
}