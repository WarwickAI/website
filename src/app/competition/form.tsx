"use client";

import React from "react";
import { useDropzone } from "react-dropzone";

export default function CompetitionSubmission(_props: any) {
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

  return (
    <section className="shadow-sm shadow-wai-gray bg-pure-white text-xl font-mono font-bold text-center text-wai-gray border-4 border-dashed rounded-lg border-wai-gray p-4 justify-self-center hover:bg-purple">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>Drag & drop your submission here. Or click to select file.</p>
        <em>(Only *.zip will be accepted.)</em>

        <br></br>
        <br></br>

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
    </section>
  );
}
