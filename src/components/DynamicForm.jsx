import { useState, useEffect } from 'react';
import { Send, Plus, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';

function DynamicForm({ schema, onSubmit }) {
    const [formData, setFormData] = useState({});

    // Initialize form data with default values if provided
    useEffect(() => {
        const initialData = {};
        schema.fields.forEach(field => {
            if (field.type === 'editable-list' && field.values) {
                initialData[field.id] = [...field.values];
            }
        });
        setFormData(prev => ({ ...prev, ...initialData }));
    }, [schema]);

    const handleChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleListChange = (id, index, value) => {
        setFormData(prev => {
            const currentList = [...(prev[id] || [])];
            currentList[index] = value;
            return { ...prev, [id]: currentList };
        });
    };

    const addListItem = (id) => {
        setFormData(prev => {
            const currentList = [...(prev[id] || [])];
            return { ...prev, [id]: [...currentList, ''] };
        });
    };

    const removeListItem = (id, index) => {
        setFormData(prev => {
            const currentList = [...(prev[id] || [])];
            currentList.splice(index, 1);
            return { ...prev, [id]: currentList };
        });
    };

    const handleCheckboxChange = (id, option, checked) => {
        setFormData(prev => {
            const current = prev[id] || [];
            if (checked) {
                return { ...prev, [id]: [...current, option] };
            } else {
                return { ...prev, [id]: current.filter(item => item !== option) };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Format data into a readable string for the AI
        let responseText = '';
        schema.fields.forEach(field => {
            const value = formData[field.id];
            if (value) {
                const label = field.label;
                let formattedValue = value;

                if (Array.isArray(value)) {
                    // Filter out empty strings for lists
                    const validItems = value.filter(item => item && item.trim() !== '');
                    if (validItems.length === 0) return; // Skip empty lists
                    formattedValue = validItems.join('; ');
                }

                responseText += `**${label}**: ${formattedValue}\n`;
            }
        });
        onSubmit(responseText);
    };

    return (
        <div className="card" style={{ marginTop: '1rem', border: '1px solid var(--color-accent)' }}>
            <form onSubmit={handleSubmit}>
                {schema.fields.map(field => (
                    <div key={field.id} style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                            {field.label}
                        </label>

                        {field.type === 'text' && (
                            <input
                                type="text"
                                className="input"
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                placeholder="请输入..."
                            />
                        )}

                        {field.type === 'textarea' && (
                            <textarea
                                className="textarea"
                                rows={3}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                placeholder="请输入..."
                            />
                        )}

                        {field.type === 'editable-list' && (
                            <div className="flex flex-col gap-sm">
                                {(formData[field.id] || []).map((item, index) => {
                                    // Handle case where item is an object (e.g. {action: "...", priority: "..."})
                                    // We flatten it to a string for the input field
                                    const displayValue = typeof item === 'object' && item !== null
                                        ? Object.values(item).join(' - ')
                                        : item;

                                    return (
                                        <div key={index} className="flex gap-sm items-center">
                                            <input
                                                type="text"
                                                className="input"
                                                value={displayValue}
                                                onChange={(e) => handleListChange(field.id, index, e.target.value)}
                                                placeholder="请输入..."
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-ghost"
                                                onClick={() => removeListItem(field.id, index)}
                                                title="删除"
                                                style={{ color: 'var(--color-text-secondary)' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    );
                                })}
                                <button
                                    type="button"
                                    className="btn btn-ghost flex items-center gap-sm"
                                    onClick={() => addListItem(field.id)}
                                    style={{ alignSelf: 'flex-start', color: 'var(--color-accent)' }}
                                >
                                    <Plus size={18} />
                                    添加更多
                                </button>
                            </div>
                        )}

                        {field.type === 'radio' && (
                            <div className="flex flex-col gap-sm">
                                {field.options.map(option => (
                                    <label key={option} className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name={field.id}
                                            value={option}
                                            onChange={(e) => handleChange(field.id, e.target.value)}
                                            style={{ accentColor: 'var(--color-accent)' }}
                                        />
                                        <span style={{ color: 'var(--color-text-secondary)' }}>{option}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {field.type === 'checkbox' && (
                            <div className="flex flex-col gap-sm">
                                {field.options.map(option => (
                                    <label key={option} className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            value={option}
                                            onChange={(e) => handleCheckboxChange(field.id, option, e.target.checked)}
                                            style={{ accentColor: 'var(--color-accent)' }}
                                        />
                                        <span style={{ color: 'var(--color-text-secondary)' }}>{option}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary">
                        <Send size={18} />
                        提交回答
                    </button>
                </div>
            </form>
        </div>
    );
}

DynamicForm.propTypes = {
    schema: PropTypes.shape({
        fields: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            options: PropTypes.arrayOf(PropTypes.string)
        })).isRequired
    }).isRequired,
    onSubmit: PropTypes.func.isRequired
};

export default DynamicForm;
