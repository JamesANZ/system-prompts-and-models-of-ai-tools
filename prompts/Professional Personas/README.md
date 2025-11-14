# Professional Personas

This directory contains system prompts for various professional personas, each designed to provide general information and education while maintaining strict boundaries around professional services.

## Available Personas

1. **Doctor** - General medical information and health education
2. **Therapist** - General mental health information and support
3. **Nutrition Specialist** - General nutrition information and dietary guidance
4. **Financial Advisor** - General financial information and planning guidance
5. **Lawyer** - General legal information and education
6. **Personal Trainer** - General fitness information and exercise guidance
7. **Career Counselor** - General career information and job market guidance
8. **Teacher** - General educational information and learning support
9. **Veterinarian** - General veterinary information and pet health guidance
10. **Accountant** - General accounting and tax information
11. **Pharmacist** - General medication information and pharmaceutical guidance

## Common Features

All professional persona prompts include:

### Source Validation

- **Mandatory WebFetch requirement**: All prompts require using WebFetch to retrieve current information from authoritative sources before providing any professional information
- **Hardcoded source URLs**: Each persona includes specific, authoritative source URLs relevant to that profession
- **Citation requirements**: Must cite sources with URLs and dates
- **Cross-referencing protocol**: Encourages multiple source verification

### Safety & Boundaries

- **Explicit AI disclosure**: All prompts clearly state the AI is not a human professional
- **Comprehensive disclaimers**: Multiple layers of disclaimers throughout each prompt
- **Professional boundaries**: Clear "NEVER" statements defining what cannot be provided
- **Referral protocols**: Specific guidance on when to recommend professional consultation

### Emergency Protocols

- **Crisis response**: Personas in medical/mental health fields include specific emergency protocols
- **Immediate referral**: Clear instructions for emergency situations
- **Resource information**: Crisis hotlines and emergency contacts where applicable

### Information Quality

- **Evidence-based**: All information must come from peer-reviewed or official sources
- **Current information**: Emphasis on fetching current data rather than relying on training data
- **Source transparency**: Must disclose when information is from training data vs. current sources

## Structure

Each persona directory contains:

- `[Persona Name].txt` - The main system prompt
- `SUMMARY.md` - Summary of the persona's features and capabilities

## Usage

These prompts are designed to be used with LLMs that have access to WebFetch or similar tools for retrieving current information from authoritative sources. The prompts enforce:

1. **Source verification** before providing any professional information
2. **Clear boundaries** between general information and professional services
3. **Professional referral** for situations requiring licensed professionals
4. **Safety protocols** for emergency situations

## Important Notes

- These personas provide **general information only**, not professional services
- They are **not substitutes** for licensed professionals
- They **must fetch current information** from authoritative sources
- They **cannot provide diagnoses, prescriptions, legal advice, or personalized professional services**
