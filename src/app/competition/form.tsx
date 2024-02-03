// Competition submission form
//
// This client side component sends a file to the some server side endpoint.

"use client";

import React from "react";
import { useFormState } from "react-dom";
import { useDropzone } from "react-dropzone";
import { handleSubmission } from "./upload";

const initialState = {
  message: "",
};

export default function CompetitionSubmission() {
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      accept: {
        "application/zip": [".zip"],
      },
      maxFiles: 1,
      multiple: false,
      maxSize: 5242880, // 5MiB
    });

  const acceptedFileItems = acceptedFiles.map((file: File) => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
    </li>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
      <ul>
        {errors.map((e) => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ul>
    </li>
  ));

  const [state, formAction] = useFormState(handleSubmission, initialState);
  return (
    <form
      action={(formData: FormData) => {
        if (acceptedFiles.length === 0) {
          // TODO(czarlinski): Add a message to the user.
          return;
        }
        formData.set("file", acceptedFiles[0]);
        return formAction(formData);
      }}
      className="shadow-sm shadow-wai-gray bg-pure-white text-xl font-mono font-bold text-center text-wai-gray border-4 rounded-lg border-wai-gray p-4 justify-self-center"
    >
      <div className="shadow-sm shadow-wai-gray bg-pure-white text-xl font-mono font-bold text-center text-wai-gray border-4  rounded-lg border-wai-gray p-4 justify-self-center hover:bg-purple">
        <input type="text" name="studentId" placeholder="Student ID" required />
      </div>

      <div className="shadow-sm shadow-wai-gray bg-pure-white text-xl font-mono font-bold text-center text-wai-gray border-4 border-dashed rounded-lg border-wai-gray p-4 justify-self-center hover:bg-purple">
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <p>Drag & drop your submission here. Or click to select file.</p>
          <em>(Only *.zip will be accepted.)</em>

          <br></br>
          <br></br>

          <p>{state?.message}</p>

          <aside>
            <h4>Accepted files</h4>
            <ul>
              {acceptedFileItems.length === 0 ? (
                <em>No files accepted.</em>
              ) : (
                acceptedFileItems
              )}
            </ul>
            <br></br>

            <h4>Rejected files</h4>
            <ul>
              {fileRejectionItems.length === 0 ? (
                <em>No files rejected.</em>
              ) : (
                fileRejectionItems
              )}
            </ul>
          </aside>
        </div>
      </div>

      <br></br>

      <input
        type="submit"
        value="Submit"
        className="shadow-sm shadow-wai-gray bg-pure-white text-xl font-mono font-bold text-center text-wai-gray border-4 rounded-lg border-wai-gray p-4 justify-self-center hover:bg-purple"
      />
    </form>
  );
}
