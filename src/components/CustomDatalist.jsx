// components/CustomDatalist.jsx
export default function CustomDatalist({ id, items }) {
  return (
    <datalist id={id}>
      {items.map((item) => (
        <option key={item._id || item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </datalist>
  );
}