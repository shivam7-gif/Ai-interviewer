import {useState} from "react";
import {toast} from "sonner";
import axios from "axios";
import {BACKEND_URL} from "../config/lib/config";
export function Form(){
  const [gitHub , setGitHub] = useState("");
  async function onSubmit (){
     if(!gitHub ){
            toast("It's not a github Or Linkedin", {
          description: "Please provide valid github and linkedin urls",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
          position : "top-center"
        })
        }
         await axios.post(`${BACKEND_URL}/api/v1/pre-interview`,{
            gitHub
        })
        console.log("Form submitted",{gitHub});
  }
  return(
     <div className ="h-screen w-screen flex justify-center items-center">
      <div>
        <h2 className ="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">Ai Interviewer Kickstart</h2>
        <input placeholder ="GitHub URL" onChange ={(e)=> setGitHub(e.target.value)}/>
        <div className="flex justify-center pt-4">
          <button onClick={onSubmit} >Start Interview</button>
          <button onClick={() => toast("Event has been created")}>Toast check</button>
        </div>
      </div>
    </div>
  )
}