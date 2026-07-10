import { headers } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type HeaderReader = Pick<Headers, "get">

function readHeader(h: HeaderReader, names: string[]) {
  for (const name of names) {
    const value = h.get(name)
    if (value) {
      try {
        return decodeURIComponent(value)
      } catch {
        return value
      }
    }
  }
  return ""
}

function readIpLocation(h: HeaderReader) {
  const country = readHeader(h, [
    "x-vercel-ip-country",
    "cf-ipcountry",
    "x-country",
  ])
  const region = readHeader(h, [
    "x-vercel-ip-country-region",
    "x-vercel-ip-region",
    "x-region",
  ])
  const city = readHeader(h, [
    "x-vercel-ip-city",
    "x-city",
  ])

  return { country, region, city }
}

const pick = (...values: any[]) => {
  for (const value of values) {
    const text = String(value || "").trim()
    if (text) return text
  }
  return ""
}

const compactUnique = (parts: string[]) => {
  const seen = new Set<string>()
  return parts.filter(part => {
    const text = String(part || "").trim()
    if (!text || seen.has(text)) return false
    seen.add(text)
    return true
  })
}

async function reverseGeocode(lat: number, lon: number) {
  const endpoint = new URL("https://nominatim.openstreetmap.org/reverse")
  endpoint.searchParams.set("format", "jsonv2")
  endpoint.searchParams.set("lat", String(lat))
  endpoint.searchParams.set("lon", String(lon))
  endpoint.searchParams.set("zoom", "18")
  endpoint.searchParams.set("addressdetails", "1")
  endpoint.searchParams.set("accept-language", "ko,en")

  const res = await fetch(endpoint.toString(), {
    cache: "no-store",
    headers: {
      accept: "application/json",
      "user-agent": "CatchForm/1.0 location analytics",
    },
  })
  if (!res.ok) throw new Error(`reverse geocode failed: ${res.status}`)

  const data = await res.json()
  const address = data?.address || {}
  const country = String(address.country_code || "").toUpperCase() || pick(address.country)
  const region = pick(address.state, address.province, address.region)
  const city = pick(address.city, address.town, address.county, address.municipality)
  const district = pick(address.borough, address.city_district, address.district, address.county)
  const neighborhood = pick(address.neighbourhood, address.suburb, address.quarter, address.village, address.hamlet, address.road)
  const geoLabel = compactUnique([
    pick(address.country),
    region,
    city,
    district,
    neighborhood,
  ]).join(" · ")

  return {
    country,
    region,
    city,
    district,
    neighborhood,
    geo_label: geoLabel,
    geo_source: "browser_geolocation",
  }
}

export async function GET(request: Request) {
  const h = await headers()
  const ipLocation = readIpLocation(h)
  const url = new URL(request.url)
  const lat = Number(url.searchParams.get("lat"))
  const lon = Number(url.searchParams.get("lon"))
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180

  if (hasCoords) {
    try {
      const precise = await reverseGeocode(lat, lon)
      return NextResponse.json(
        {
          ...ipLocation,
          ...precise,
          latitude: String(lat),
          longitude: String(lon),
          ip_country: ipLocation.country,
          ip_region: ipLocation.region,
          ip_city: ipLocation.city,
        },
        {
          headers: {
            "cache-control": "no-store, max-age=0",
          },
        },
      )
    } catch {
      return NextResponse.json(
        {
          ...ipLocation,
          latitude: String(lat),
          longitude: String(lon),
          geo_source: "browser_geolocation_unresolved",
        },
        {
          headers: {
            "cache-control": "no-store, max-age=0",
          },
        },
      )
    }
  }

  return NextResponse.json(
    { ...ipLocation, geo_source: "ip_header" },
    {
      headers: {
        "cache-control": "no-store, max-age=0",
      },
    },
  )
}
