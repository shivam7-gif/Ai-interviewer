import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "../lib/config";
import { useNavigate } from "react-router-dom";

export function Form() {
  const [gitHub, setGitHub] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (!gitHub) {
      toast("It's not a github Or Linkedin", {
        description: "Please provide valid github and linkedin urls",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
        position: "top-center",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, {
        gitHub,
      });

      const projectId = response.data.projectId ?? response.data.project?.id;

      if (!projectId) {
        toast("Could not start interview", {
          description: "The server did not return a project ID.",
          position: "top-center",
        });
        return;
      }

      navigate(`/project/${projectId}`);
      console.log("Form submitted", { gitHub, projectId });
    } catch (error) {
      toast("Something went wrong", {
        description: "Failed to start the interview.",
        position: "top-center",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div>
        <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
          Ai Interviewer Kickstart
        </h2>
        <input
          placeholder="GitHub URL"
          onChange={(e) => setGitHub(e.target.value)}
        />
        <div className="flex justify-center pt-4">
          <button onClick={onSubmit} disabled={loading}>
            {loading ? "Loading...." : "Start Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}
