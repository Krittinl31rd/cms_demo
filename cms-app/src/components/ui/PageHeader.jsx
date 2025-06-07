import React from "react";
import { Link } from "react-router-dom";

const PageHeader = ({ segments = [] }) => {
  return (
    <div className="flex-1 text-xl mb-2">
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        return (
          <span key={index}>
            {segment.href && !isLast ? (
              <Link to={segment.href} className="text-gray-500 hover:underline">
                {segment.label}
              </Link>
            ) : (
              segment.label
            )}
            {!isLast && " / "}
          </span>
        );
      })}
    </div>
  );
};

export default PageHeader;
