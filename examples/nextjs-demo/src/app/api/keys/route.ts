/**
 * Key Management API Route
 *
 * Handles public key retrieval and management
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock public key storage (in production, use proper key management)
const publicKeys = new Map<string, string>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (address) {
    const publicKey = publicKeys.get(address);
    if (!publicKey) {
      return NextResponse.json(
        { error: 'Public key not found for address' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      address,
      publicKey,
      timestamp: new Date().toISOString(),
    });
  }

  // Return all keys (for admin/debugging)
  return NextResponse.json({
    keys: Array.from(publicKeys.entries()).map(([addr, key]) => ({
      address: addr,
      publicKey: key,
    })),
    count: publicKeys.size,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, publicKey } = body;

    if (!address || !publicKey) {
      return NextResponse.json(
        { error: 'Missing required parameters: address, publicKey' },
        { status: 400 }
      );
    }

    // Store the public key
    publicKeys.set(address, publicKey);

    return NextResponse.json({
      success: true,
      message: 'Public key stored successfully',
      address,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Key management error:', error);
    return NextResponse.json(
      { error: 'Failed to store public key' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Missing required parameter: address' },
      { status: 400 }
    );
  }

  const deleted = publicKeys.delete(address);

  if (!deleted) {
    return NextResponse.json(
      { error: 'Public key not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Public key deleted successfully',
    address,
  });
}
