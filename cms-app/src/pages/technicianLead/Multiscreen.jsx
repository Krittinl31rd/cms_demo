import { Trash, Plus, Settings, Sun, Clock, Save } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

const Multiscreen = () => {
  const [scenes, setScenes] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    minKelvin: 2500,
    maxKelvin: 6500,
    maxDimLevel: 100,
    minTransition: 1,
  });

  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = String(h).padStart(2, "0");
        const minute = String(m).padStart(2, "0");
        const time = `${hour}:${minute}`;
        options.push(
          <option key={time} value={time}>
            {time}
          </option>
        );
      }
    }
    return options;
  };

  const generateDimOptions = () => {
    const options = [];
    for (let i = 0; i <= settings.maxDimLevel; i += 10) {
      options.push(
        <option key={i} value={i}>
          {i}%
        </option>
      );
    }
    return options;
  };

  const generateTransitionOptions = () => {
    const options = [];
    for (let m = settings.minTransition; m <= 60; m++) {
      options.push(
        <option key={m} value={m}>
          {m}min
        </option>
      );
    }
    return options;
  };

  const handleCreateEvent = () => {
    if (scenes.length == 48)
      return toast.error("Do not create more than 48 scene");
    const newScene = {
      id: Date.now(),
      name: `Scene ${scenes.length + 1}`,
      time: "09:00",
      color: Math.floor((settings.minKelvin + settings.maxKelvin) / 2),
      dim: 50,
      transition: 5,
    };
    setScenes((prev) => [...prev, newScene]);
  };

  const handleDeleteScene = (id) => {
    setScenes((prev) => prev.filter((scene) => scene.id !== id));
  };

  const updateScene = (id, field, value) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === id ? { ...scene, [field]: value } : scene
      )
    );
  };

  const updateSettings = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      {/* <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Sun className="w-8 h-8 text-yellow-500" />
          Scene Controller
        </h1>
        <p className="text-gray-600">
          Create and manage light level & color temp scenes with custom
          schedules
        </p>
      </div> */}

      {/* Action Bar */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCreateEvent}
            className="flex items-center gap-2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add New Scene
          </button>

          {scenes.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{scenes.length}</span>
              scene{scenes.length !== 1 ? "s" : ""} configured
              {scenes.length == 48 && (
                <span className="font-medium text-red-600">
                  (Maximum {scenes.length} scenes)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              showSettings
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>

          <button
            //   onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Global Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Min Kelvin
              </label>
              <input
                type="number"
                min="1000"
                max="10000"
                step={100}
                value={settings.minKelvin}
                onChange={(e) =>
                  updateSettings("minKelvin", Number(e.target.value))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Max Kelvin
              </label>
              <input
                type="number"
                min="1000"
                max="10000"
                value={settings.maxKelvin}
                step={100}
                onChange={(e) =>
                  updateSettings("maxKelvin", Number(e.target.value))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Max Dim %
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={settings.maxDimLevel}
                step={10}
                onChange={(e) =>
                  updateSettings("maxDimLevel", Number(e.target.value))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Min Transition
              </label>
              <input
                type="number"
                min="1"
                max="59"
                value={settings.minTransition}
                onChange={(e) =>
                  updateSettings("minTransition", Number(e.target.value))
                }
                className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Scenes List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {scenes.length >= 1 ? (
          <div className="divide-y divide-gray-200">
            {scenes.map((scene, index) => (
              <div
                key={scene.id}
                className="p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={scene.name}
                      onChange={(e) =>
                        updateScene(scene.id, "name", e.target.value)
                      }
                      className=" font-semibold bg-transparent border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1 transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteScene(scene.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Time */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Schedule Time
                    </label>
                    <select
                      value={scene.time}
                      onChange={(e) =>
                        updateScene(scene.id, "time", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {generateTimeOptions()}
                    </select>
                  </div>

                  {/* Color Temperature */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Color Temperature
                    </label>
                    <div>
                      <input
                        type="range"
                        min={settings.minKelvin}
                        max={settings.maxKelvin}
                        step={100}
                        value={scene.color}
                        onChange={(e) =>
                          updateScene(scene.id, "color", Number(e.target.value))
                        }
                        className="range-basic w-full h-10 rounded-sm appearance-none bg-gray-300 transition-all duration-300 focus:outline-none"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Warm</span>
                        <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                          {scene.color}K
                        </span>
                        <span className="text-xs text-gray-500">Cool</span>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Brightness
                      </label>
                      <select
                        value={scene.dim}
                        onChange={(e) =>
                          updateScene(scene.id, "dim", Number(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {generateDimOptions()}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Transition
                      </label>
                      <select
                        value={scene.transition}
                        onChange={(e) =>
                          updateScene(
                            scene.id,
                            "transition",
                            Number(e.target.value)
                          )
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {generateTransitionOptions()}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sun className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No scenes yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first lighting scene to get started
            </p>
            <button
              onClick={handleCreateEvent}
              className="inline-flex items-center gap-2 bg-blue-500  px-4 py-2 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Your First Scene
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Multiscreen;
