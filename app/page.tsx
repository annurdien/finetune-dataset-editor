"use client"

import { useState } from 'react';

interface FineTuneData {
  system: string;
  prompt: string;
  response: string;
}

export default function Home() {
  const [system, setSystem] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [datasets, setDatasets] = useState<FineTuneData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Handle adding or updating a dataset
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newData: FineTuneData = { system, prompt, response };

    if (editingIndex !== null) {
      // Update the dataset if we're editing
      const updatedDatasets = [...datasets];
      updatedDatasets[editingIndex] = newData;
      setDatasets(updatedDatasets);
      setEditingIndex(null); // Reset the editing state
    } else {
      // Add a new dataset if we're not editing
      setDatasets((prevDatasets) => [...prevDatasets, newData]);
    }

    // Reset input fields
    setSystem('');
    setPrompt('');
    setResponse('');
  };

  // Apply the current system message to all datasets
  const handleApplyToAll = () => {
    const updatedDatasets = datasets.map(dataset => ({
      ...dataset,
      system, // Apply current system message to all datasets
    }));
    setDatasets(updatedDatasets);
  };

  // Handle editing an existing dataset
  const handleEdit = (index: number) => {
    const datasetToEdit = datasets[index];
    setSystem(datasetToEdit.system);
    setPrompt(datasetToEdit.prompt);
    setResponse(datasetToEdit.response);
    setEditingIndex(index); // Track the index of the dataset being edited
  };

  // Handle deleting a dataset
  const handleDelete = (index: number) => {
    const updatedDatasets = datasets.filter((_, i) => i !== index);
    setDatasets(updatedDatasets);
    if (editingIndex === index) {
      // Reset form if the dataset being edited is deleted
      setSystem('');
      setPrompt('');
      setResponse('');
      setEditingIndex(null);
    }
  };

  // Handle downloading the datasets as a JSONL file
  const handleDownload = () => {
    const jsonlData = datasets
      .map((data) =>
        JSON.stringify({
          ...data,
          // Replace actual newlines with literal `\n`
          system: data.system.replace(/\n/g, '\\n'),
          prompt: data.prompt.replace(/\n/g, '\\n'),
          response: data.response.replace(/\n/g, '\\n'),
        })
      )
      .join('\n'); // Join with newline characters between JSON objects
    const blob = new Blob([jsonlData], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'fine-tune-dataset.jsonl';
    link.click();
  };

  // Handle search filtering
  const filteredDatasets = datasets.filter((dataset) =>
    dataset.system.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dataset.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-[#0D1117]">
      {/* Sidebar */}
      <div className="w-1/4 bg-[#161B22] text-[#C9D1D9] p-4 overflow-y-auto h-screen">
        <div className="relative mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search the dataset..."
            className="w-full p-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#58A6FF] bg-[#161B22] text-[#C9D1D9]"
          />
        </div>

        <ul className="space-y-3">
          {filteredDatasets.map((dataset, index) => (
            <li
              key={index}
              className="bg-[#58A6FF] text-black p-3 rounded-lg shadow hover:bg-[#1F6FEB] transition duration-200 flex justify-between items-center"
            >
              <div onClick={() => handleEdit(index)} className="cursor-pointer flex-1">
                <strong>System:</strong> {dataset.system}, <strong>Prompt:</strong> {dataset.prompt}
              </div>
              <button
                className="ml-4 bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600 transition duration-200"
                onClick={() => handleDelete(index)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        <button
          className="mt-8 w-full bg-[#58A6FF] text-black py-3 rounded-full shadow hover:bg-[#1F6FEB] transition duration-200"
          onClick={handleDownload}
        >
          Download JSONL
        </button>
      </div>

      {/* Main content */}
      <div className="w-3/4 p-10">
        <div className="bg-[#161B22] p-8 shadow-lg rounded-lg">
          <h1 className="text-2xl font-semibold mb-8 text-[#F0F6FC]">
            {editingIndex !== null ? 'Update Dataset' : 'Fine-tune Dataset'}
          </h1>

          <form onSubmit={handleSubmit}>
            {/* System */}
            <div className="mb-6">
              <label className="block font-medium text-[#F0F6FC] mb-2">SYSTEM</label>
              <textarea
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                placeholder="Describe the system behavior"
                className="w-full p-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#58A6FF] bg-[#161B22] text-[#C9D1D9] h-24"
                required
              ></textarea>
            </div>

            <div className="mb-6">
              {/* Apply to All Button */}
              <button
                type="button"
                onClick={handleApplyToAll}
                className="bg-[#58A6FF] text-black px-6 py-3 rounded-full shadow hover:bg-[#1F6FEB] transition duration-200"
              >
                Apply to All
              </button>
            </div>

            {/* Prompt */}
            <div className="mb-6">
              <label className="block font-medium text-[#F0F6FC] mb-2">USER</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter the prompt"
                className="w-full p-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#58A6FF] bg-[#161B22] text-[#C9D1D9] h-24"
                required
              ></textarea>
            </div>

            {/* Response */}
            <div className="mb-6">
              <label className="block font-medium text-[#F0F6FC] mb-2">ASSISTANT</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Enter the assistant's response"
                className="w-full p-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#58A6FF] bg-[#161B22] text-[#C9D1D9] h-24"
                required
              ></textarea>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                className="bg-[#58A6FF] text-black px-6 py-3 rounded-full shadow hover:bg-[#1F6FEB] transition duration-200"
              >
                {editingIndex !== null ? 'Update Data' : 'Add Data'}
              </button>
              {editingIndex !== null && (
                <button
                  className="bg-gray-500 text-white px-6 py-3 rounded-full shadow hover:bg-gray-600 transition duration-200"
                  onClick={() => {
                    // Reset the form if user cancels editing
                    setSystem('');
                    setPrompt('');
                    setResponse('');
                    setEditingIndex(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}