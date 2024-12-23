'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'

export default function Home() {
  const [formData, setFormData] = useState({
    product_name: '',
    tagline: '',
    brand_palette: ['#FFC107', '#212121', '#FFFFFF'],
    cta_text: '',
    logo_url: '',
    product_image_url: '',
    target_audience: '',
    scoring_criteria: Array(5).fill({ parameter: '', weight: 0 }),
  })
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generatedImages, setGeneratedImages] = useState([])

  const handleInputChange = (e, index, field) => {
    const { name, value } = e.target
    if (name === 'brand_palette') {
      const newPalette = [...formData.brand_palette]
      newPalette[index] = value
      setFormData((prev) => ({ ...prev, brand_palette: newPalette }))
    } else if (name === 'scoring_criteria') {
      const newCriteria = [...formData.scoring_criteria]
      newCriteria[index] = { ...newCriteria[index], [field]: value }
      setFormData((prev) => ({ ...prev, scoring_criteria: newCriteria }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('http://localhost:3000/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creative_details: {
            product_name: formData.product_name,
            tagline: formData.tagline,
            brand_palette: formData.brand_palette,
            dimensions: { width: 1080, height: 1080 },
            cta_text: formData.cta_text,
            logo_url: formData.logo_url,
            product_image_url: formData.product_image_url,
            target_audience:formData.target_audience
          },
          scoring_criteria: formData.scoring_criteria,
        }),
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`)
      }

      const data = await res.json()

      if (!data.creative_url) {
        throw new Error('Creative URL missing in response')
      }

      setResponse(data)
      setGeneratedImages((prevImages) => [
        ...prevImages,
        data.creative_url.split('/').pop(),
      ])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Creative Evaluation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="product_name"
          placeholder="Product Name"
          value={formData.product_name}
          onChange={handleInputChange}
        />
        <Input
          name="tagline"
          placeholder="Tagline"
          value={formData.tagline}
          onChange={handleInputChange}
        />
        <div className="flex space-x-2">
          {formData.brand_palette.map((color, index) => (
            <Input
              key={`brand_palette_${index}`}
              name="brand_palette"
              type="color"
              value={color}
              onChange={(e) => handleInputChange(e, index)}
            />
          ))}
        </div>
        <Input
          name="cta_text"
          placeholder="CTA Text"
          value={formData.cta_text}
          onChange={handleInputChange}
        />
        <Input
          name="logo_url"
          placeholder="Logo URL"
          value={formData.logo_url}
          onChange={handleInputChange}
        />
        <Input
          name="product_image_url"
          placeholder="Product Image URL"
          value={formData.product_image_url}
          onChange={handleInputChange}
        />
        <Input
          name="target_audience"
          placeholder="Target Audience"
          value={formData.target_audience}
          onChange={handleInputChange}
        />
        {formData.scoring_criteria.map((criteria, index) => (
          <div key={`scoring_criteria_${index}`} className="flex space-x-2">
            <Input
              name="scoring_criteria"
              placeholder="Parameter"
              value={criteria.parameter}
              onChange={(e) => handleInputChange(e, index, 'parameter')}
            />
            <Input
              name="scoring_criteria"
              type="number"
              placeholder="Weight"
              value={criteria.weight}
              onChange={(e) => handleInputChange(e, index, 'weight')}
            />
          </div>
        ))}
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Evaluate'}
        </Button>
      </form>

      {formData.product_image_url && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-2">Product Image</h2>
            <Image
              src={formData.product_image_url}
              alt="Product"
              width={300}
              height={300}
              className="rounded-md"
            />
          </CardContent>
        </Card>
      )}

      {response && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-2">Evaluation Results</h2>
            <Image
              src={response.creative_url}
              alt="Generated Creative"
              width={300}
              height={300}
              className="rounded-md mb-2"
            />
            <p><strong>Status:</strong> {response.status}</p>
            <p><strong>Score:</strong> {response.scoring?.completeScore}</p>
            <p><strong>File Size:</strong> {response.metadata?.file_size_kb} KB</p>
            <p><strong>Dimensions:</strong> {response.metadata?.dimensions?.width}x{response.metadata?.dimensions?.height}</p>
          </CardContent>
        </Card>
      )}

      <h2 className="text-xl font-semibold mt-8 mb-4">Generated Images</h2>
      <div className="grid grid-cols-3 gap-4">
        {generatedImages.map((image, index) => (
          <Image
            key={`generated_image_${index}`}
            src={`http://localhost:3000/imagesGen/${image}`}
            alt={`Generated Image ${index + 1}`}
            width={300}
            height={300}
            className="rounded-md"
          />
        ))}
      </div>
    </div>
  )
}
