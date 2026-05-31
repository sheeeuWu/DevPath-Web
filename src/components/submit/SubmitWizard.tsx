"use client";

import { useState } from 'react';
import { Check, Upload, ArrowRight, ArrowLeft, X } from 'lucide-react';
import Button from '../ui/Button';
import styles from './SubmitWizard.module.css';

interface SubmitWizardFormData {
    title: string;
    description: string;
    primaryLanguage: string;
    frameworks: string;
    thumbnail: File | null;
    demoUrl: string;
}

const steps = ['Details', 'Tech Stack', 'Media', 'Review'];

export default function SubmitWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState<SubmitWizardFormData>({
        title: '',
        description: '',
        primaryLanguage: 'JavaScript',
        frameworks: '',
        thumbnail: null,
        demoUrl: ''
    });
    const [errors, setErrors] = useState<Partial<Record<keyof SubmitWizardFormData, string>> & { submit?: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (field: keyof SubmitWizardFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type (images only)
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, thumbnail: 'Please select an image file' }));
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, thumbnail: 'File size must be less than 5MB' }));
                return;
            }
            setFormData(prev => ({ ...prev, thumbnail: file }));
            if (errors.thumbnail) {
                setErrors(prev => ({ ...prev, thumbnail: undefined }));
            }
        }
    };

    const handleRemoveThumbnail = () => {
        setFormData(prev => ({ ...prev, thumbnail: null }));
    };

    const validateUrl = (url: string): boolean => {
        try {
            const parsed = new URL(url.trim());
            return parsed.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Partial<Record<keyof SubmitWizardFormData, string>> = {};
        
        if (step === 0) {
            if (!formData.title.trim()) newErrors.title = 'Title is required';
            if (!formData.description.trim()) newErrors.description = 'Description is required';
        }
        
        if (step === 1) {
            if (!formData.frameworks.trim()) newErrors.frameworks = 'Frameworks are required';
        }
        
        if (step === 2) {
            if (!formData.demoUrl.trim()) newErrors.demoUrl = 'Demo URL is required';
            if (formData.demoUrl.trim() && !validateUrl(formData.demoUrl)) {
                newErrors.demoUrl = 'Please enter a valid HTTPS URL';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;
        
        setIsSubmitting(true);
        
        try {
            // TODO: Integrate with Firebase project submission
            // This would call the existing project submission logic
            console.log('Submitting project:', {
                title: formData.title,
                description: formData.description,
                primaryLanguage: formData.primaryLanguage,
                frameworks: formData.frameworks,
                demoUrl: formData.demoUrl,
                thumbnail: formData.thumbnail ? formData.thumbnail.name : null,
                thumbnailSize: formData.thumbnail ? formData.thumbnail.size : null
            });
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error submitting project:', error);
            setErrors({ submit: 'Failed to submit project. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) return;
        
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (isSubmitted) {
        return (
            <section className={styles.wizard}>
                <div className={styles.container}>
                    <div className={styles.formCard}>
                        <div className={styles.success}>
                            <div className={styles.successIcon}>
                                <Check size={40} />
                            </div>
                            <h2 className={styles.title}>Project Submitted!</h2>
                            <p className={styles.subtitle}>
                                Your project has been successfully submitted for review.
                                It will be live on the showcase within 24 hours.
                            </p>
                            <Button aria-label="Action button"  variant="primary" className="mt-8" onClick={() => window.location.href = '/'}>
                                Return Home
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.wizard}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Submit Your Project</h1>
                    <p className={styles.subtitle}>Share your work with the community and get feedback.</p>
                </div>

                <div className={styles.progress}>
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`${styles.step} ${index === currentStep ? styles.activeStep :
                                    index < currentStep ? styles.completedStep : ''
                                }`}
                        >
                            {index < currentStep ? <Check size={20} /> : index + 1}
                        </div>
                    ))}
                </div>

                <div className={styles.formCard}>
                    {currentStep === 0 && (
                        <div className="space-y-6">
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Project Title</label>
                                <input 
                                    type="text" 
                                    className={styles.input} 
                                    placeholder="e.g. AI Code Assistant"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                />
                                {errors.title && <span style={{ display: 'block', marginTop: '6px', fontSize: '14px', color: '#ef4444' }}>{errors.title}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Description</label>
                                <textarea 
                                    className={styles.textarea} 
                                    placeholder="Describe your project..."
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    rows={4}
                                />
                                {errors.description && <span style={{ display: 'block', marginTop: '6px', fontSize: '14px', color: '#ef4444' }}>{errors.description}</span>}
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Primary Language</label>
                                <select 
                                    className={styles.select}
                                    value={formData.primaryLanguage}
                                    onChange={(e) => handleChange('primaryLanguage', e.target.value)}
                                >
                                    <option value="JavaScript">JavaScript</option>
                                    <option value="Python">Python</option>
                                    <option value="Go">Go</option>
                                    <option value="Rust">Rust</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Frameworks</label>
                                <input 
                                    type="text" 
                                    className={styles.input} 
                                    placeholder="e.g. React, Next.js, Django"
                                    value={formData.frameworks}
                                    onChange={(e) => handleChange('frameworks', e.target.value)}
                                />
                                {errors.frameworks && <span style={{ display: 'block', marginTop: '6px', fontSize: '14px', color: '#ef4444' }}>{errors.frameworks}</span>}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Project Thumbnail</label>
                                <div className={styles.uploadArea}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                        id="thumbnail-upload"
                                    />
                                    {!formData.thumbnail ? (
                                        <label 
                                            htmlFor="thumbnail-upload"
                                            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                        >
                                            <Upload size={32} style={{ margin: '0 auto 16px', color: 'var(--text-secondary)' }} />
                                            <p style={{ color: 'var(--text-secondary)' }}>Drag and drop or click to upload</p>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '8px' }}>
                                                PNG, JPG, GIF up to 5MB
                                            </p>
                                        </label>
                                    ) : (
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                                {formData.thumbnail.name}
                                            </p>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px' }}>
                                                {(formData.thumbnail.size / 1024).toFixed(2)} KB
                                            </p>
                                            <button aria-label="Action button" 
                                                type="button"
                                                onClick={handleRemoveThumbnail}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: 'var(--accent-primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <X size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {errors.thumbnail && <span style={{ display: 'block', marginTop: '6px', fontSize: '14px', color: '#ef4444' }}>{errors.thumbnail}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Demo URL</label>
                                <input 
                                    type="url" 
                                    className={styles.input} 
                                    placeholder="https://"
                                    value={formData.demoUrl}
                                    onChange={(e) => handleChange('demoUrl', e.target.value)}
                                />
                                {errors.demoUrl && <span style={{ display: 'block', marginTop: '6px', fontSize: '14px', color: '#ef4444' }}>{errors.demoUrl}</span>}
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h3 className={styles.label}>Review Details</h3>
                            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px' }}>
                                <div className="space-y-4">
                                    <div>
                                        <span className={styles.label}>Title:</span>
                                        <p style={{ color: 'var(--text-secondary)' }}>{formData.title || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <span className={styles.label}>Description:</span>
                                        <p style={{ color: 'var(--text-secondary)' }}>{formData.description || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <span className={styles.label}>Language:</span>
                                        <p style={{ color: 'var(--text-secondary)' }}>{formData.primaryLanguage}</p>
                                    </div>
                                    <div>
                                        <span className={styles.label}>Frameworks:</span>
                                        <p style={{ color: 'var(--text-secondary)' }}>{formData.frameworks || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <span className={styles.label}>Thumbnail:</span>
                                        <p style={{ color: 'var(--text-secondary)' }}>
                                            {formData.thumbnail ? formData.thumbnail.name : 'Not provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className={styles.label}>Demo URL:</span>
                                        <p style={{ color: 'var(--text-secondary)' }}>{formData.demoUrl || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                            {errors.submit && <span style={{ display: 'block', marginTop: '6px', fontSize: '14px', color: '#ef4444' }}>{errors.submit}</span>}
                        </div>
                    )}

                    <div className={styles.actions}>
                        <Button aria-label="Action button" 
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            style={{ opacity: currentStep === 0 ? 0.5 : 1 }}
                        >
                            <ArrowLeft size={20} /> Back
                        </Button>
                        <Button aria-label="Action button"  
                            variant="primary" 
                            onClick={handleNext}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : (currentStep === steps.length - 1 ? 'Submit Project' : 'Next Step')} {!isSubmitting && <ArrowRight size={20} />}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
