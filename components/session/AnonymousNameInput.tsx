interface AnonymousNameInputProps {
  anonymousUserName: string
  onNameChange: (name: string) => void
}

export function AnonymousNameInput({
  anonymousUserName,
  onNameChange,
}: AnonymousNameInputProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <label className="block text-gray-800 font-medium mb-2">
        Ditt navn <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={anonymousUserName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Skriv inn navnet ditt..."
        className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-gray-800 focus:outline-none focus:border-gray-400 shadow-sm"
      />
      <p className="text-sm text-gray-500 mt-2">
        Navnet ditt vil bli vist sammen med svarene dine.
      </p>
    </div>
  )
}
