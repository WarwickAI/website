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
      className="justify-self-center rounded-lg border-4 border-wai-gray bg-pure-white p-4 text-center font-mono text-xl font-bold text-wai-gray shadow-sm shadow-wai-gray"
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

      <p className="text-sm">
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

      <input
        type="submit"
        value="Submit"
        className="justify-self-center rounded-lg border-4 border-wai-gray bg-pure-white p-4 text-center font-mono text-xl font-bold text-wai-gray shadow-sm shadow-wai-gray hover:bg-purple"
      />
    </form>
  );
}
