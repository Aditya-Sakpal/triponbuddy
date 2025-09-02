import { useState } from "react";

export const SeasonSelector = () => {
    const [activeTab, setActiveTab] = useState("summer");

    return (
        <div className="flex justify-center mb-12">
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                <button
                    onClick={() => setActiveTab("summer")}
                    className={`px-6 py-3 rounded-lg text-base font-medium transition-all ${
                        activeTab === "summer" 
                        ? "bg-white text-blue-600 shadow-sm border-b-2 border-blue-600" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    >
                    Summer Destinations
                </button>
                <button
                    onClick={() => setActiveTab("winter")}
                    className={`px-6 py-3 rounded-lg text-base font-medium transition-all ${
                        activeTab === "winter" 
                        ? "bg-white text-blue-600 shadow-sm border-b-2 border-blue-600" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    >
                    Winter Destinations
                </button>
                <button
                    onClick={() => setActiveTab("monsoon")}
                    className={`px-6 py-3 rounded-lg text-base font-medium transition-all ${
                        activeTab === "monsoon" 
                        ? "bg-white text-blue-600 shadow-sm border-b-2 border-blue-600" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    >
                    Monsoon Escapes
                </button>
                <button
                    onClick={() => setActiveTab("autumn")}
                    className={`px-6 py-3 rounded-lg text-base font-medium transition-all ${
                        activeTab === "autumn" 
                        ? "bg-white text-blue-600 shadow-sm border-b-2 border-blue-600" 
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    >
                    Autumn Favorites
                </button>
            </div>
        </div>
    );
};