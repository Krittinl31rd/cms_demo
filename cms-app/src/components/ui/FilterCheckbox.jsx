import { Check } from "lucide-react";

const RoomFilterCheckbox = ({ filterKey, label, filters, toggleFilter }) => {
  const isChecked = filters.includes(filterKey);

  return (
    <label className="relative flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={isChecked}
        className="peer hidden"
        onChange={() => toggleFilter(filterKey)}
      />
      <div
        className="flex items-center gap-1 border border-gray-400 px-2 py-1 rounded-full 
        peer-checked:bg-blue-100 peer-checked:border-blue-100 peer-checked:text-blue-500 peer-checked:pl-7"
      >
        <span className="font-semibold">{label}</span>
      </div>
      <Check className="absolute top-2 left-2 w-4 h-4 text-blue-500 hidden peer-checked:block" />
    </label>
  );
};

export default RoomFilterCheckbox;
