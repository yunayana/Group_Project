type InformationBoxesProps = {
  text: string;
  value: string | number;
};

export const InformationBoxes = ({ text, value }: InformationBoxesProps) => {
  return (
    <div className="bg-white border border-gray-800 p-6 rounded-lg shadow-sm">
      <h3 className="text-gray-400 text-sm uppercase mb-2">{text}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};
