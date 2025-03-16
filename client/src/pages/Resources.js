// src/pages/Resources.js
import React from "react";
import "./Resources.css";

const resourcesData = [
  {
    id: 1,
    title: "Healthy Eating Guide",
    description:
      "A comprehensive guide to balanced nutrition and healthy eating habits.",
    link: "https://example.com/healthy-eating-guide.pdf",
  },
  {
    id: 2,
    title: "Exercise Routines for Beginners",
    description:
      "Simple exercises to help beginners get started with a fitness routine.",
    link: "https://example.com/exercise-routines.pdf",
  },
  {
    id: 3,
    title: "Managing Stress and Mental Health",
    description:
      "Resources and techniques to manage stress and improve mental well-being.",
    link: "https://example.com/stress-management.pdf",
  },
  {
    id: 4,
    title: "Vaccination Schedules",
    description: "A guide to recommended vaccinations for adults and children.",
    link: "https://example.com/vaccination-schedules.pdf",
  },
];

const Resources = () => {
  return (
    <div className="resources">
      <h1 className="resources-title">Health & Wellness Resources</h1>
      <p className="resources-description">
        Explore our collection of articles, guides, and tools to help you on
        your journey to better health.
      </p>

      <div className="resources-list">
        {resourcesData.map((resource) => (
          <div key={resource.id} className="resource-card">
            <h2 className="resource-title">{resource.title}</h2>
            <p className="resource-description">{resource.description}</p>
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="resource-link"
            >
              View Resource
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;
