interface CardErrorProps {
  title: string;
  tryText: string;
  refetch: () => void;
}

export const CardError = ({ title, tryText, refetch }: CardErrorProps) => {
  return (
    <div className="p-4 border border-red-300 bg-red-50 rounded-md">
      <p className="text-red-500">{title}</p>
      <button
        onClick={refetch}
        className="mt-2 text-sm text-blue-500 hover:underline"
      >
        {tryText}
      </button>
    </div>
  );
};
