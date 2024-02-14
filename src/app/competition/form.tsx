// Competition submission form
//
// This client side component sends a file to the some server side endpoint.

"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useDropzone } from "react-dropzone";
import { handleSubmission } from "./upload";

const initialState = {
  message: "",
  loading: false,
};

export default function CompetitionSubmission() {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/zip": [".zip"],
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 5242880, // 5MiB
  });

  const acceptedFileItems = acceptedFiles.map((file: File) => (
    <li key={file.name}>
      Accepted file: {file.name} - {file.size} bytes
    </li>
  ));

  const [state, formAction] = useFormState(handleSubmission, initialState);
  const [localError, setLocalError] = useState("");

  return (
    <form
      action={(formData: FormData) => {
        setLocalError("");
        if (acceptedFiles.length === 0) {
          setLocalError("A file is required.");
          return;
        }
        formData.set("file", acceptedFiles[0]);
        return formAction(formData);
      }}
      className="max-w-3xl justify-self-center rounded-lg border-4 border-wai-gray bg-pure-white p-4 text-center font-mono text-xl font-bold text-wai-gray shadow-sm shadow-wai-gray"
    >
      <div className="justify-self-center rounded-lg border-4 border-wai-gray bg-pure-white p-4 text-center font-mono text-xl font-bold text-wai-gray shadow-sm shadow-wai-gray">
        <label htmlFor="studentId">Student ID (digits only)</label>
        <br></br>
        <input
          type="text"
          name="studentId"
          placeholder="2134567"
          pattern="[0-9]{6,8}"
          required
        />
      </div>
      <div className="justify-self-center rounded-lg border-4 border-wai-gray bg-pure-white p-4 text-center font-mono text-xl font-bold text-wai-gray shadow-sm shadow-wai-gray">
        <label htmlFor="email">University of Warwick Email Address</label>
        <br></br>
        <input
          type="email"
          name="studentEmail"
          placeholder="name@warwick.ac.uk"
          required
        />
      </div>

      <div className="justify-self-center rounded-lg border-4 border-dashed border-wai-gray bg-pure-white p-4 text-center font-mono text-xl font-bold text-wai-gray shadow-sm shadow-wai-gray hover:bg-purple">
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <p>Drag & drop your submission here. Or click to select file.</p>
          <em className="text-base">(Only *.zip will be accepted.)</em>

          <aside className="p-4">
            {acceptedFileItems.length === 0 ? (
              <em>No files accepted.</em>
            ) : (
              acceptedFileItems
            )}
          </aside>
        </div>
      </div>

      <p className="p-4 text-sm">
        Upon submission, your student ID will be publicly visible on our website
        and used for processing your submitted zip archive. Your university
        email address will be used for verification of your student status,
        checking for a valid ticket, and contacting you upon being eligible for
        a prize or if there are any issues with your submission. Files will be
        deleted within 7 days of the competition finishing. To be eligible for a
        prize you must have a ticket for the 2024 WAI Summit, be in the top 3
        submissions on the leaderboard, and not be disqualified. Malicious
        entires will cause in your disqualification. By submitting you agree to
        the above terms and conditions.
      </p>

      <p className="p-4">{localError || state?.message || ""}</p>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  // A button that is disabled when the form is pending.
  const status = useFormStatus();
  return (
    <input
      type="submit"
      value={status.pending ? "Submitting..." : "Submit"}
      disabled={status.pending}
      className="m-2 w-1/2 justify-self-center rounded-lg border-4 border-wai-gray bg-pure-white p-4 text-center font-mono text-xl font-bold text-wai-gray shadow-sm shadow-wai-gray hover:bg-purple"
    />
  );
}
