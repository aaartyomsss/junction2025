from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from database import get_session
from db_models import Sauna

router = APIRouter(prefix="/saunas", tags=["Saunas"])


@router.get("/", response_model=List[Sauna])
async def list_saunas(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of records to return"),
    rating: Optional[int] = Query(None, ge=1, le=5, description="Filter by rating"),
    session: Session = Depends(get_session)
):
    """
    Get list of all saunas
    
    Parameters:
    - skip: Number of records to skip (for pagination)
    - limit: Maximum number of records to return (default: 100, max: 500)
    - rating: Optional filter by rating (1-5)
    """
    statement = select(Sauna).offset(skip).limit(limit)
    
    # Add rating filter if provided
    if rating is not None:
        statement = statement.where(Sauna.rating == rating)
    
    # Order by rating (highest first), then by name
    statement = statement.order_by(Sauna.rating.desc(), Sauna.name)
    
    saunas = session.exec(statement).all()
    return saunas


@router.get("/{sauna_id}", response_model=Sauna)
async def get_sauna(sauna_id: int, session: Session = Depends(get_session)):
    """Get a specific sauna by ID"""
    sauna = session.get(Sauna, sauna_id)
    if not sauna:
        raise HTTPException(status_code=404, detail="Sauna not found")
    return sauna


@router.post("/", response_model=Sauna, status_code=201)
async def create_sauna(sauna: Sauna, session: Session = Depends(get_session)):
    """Create a new sauna"""
    session.add(sauna)
    session.commit()
    session.refresh(sauna)
    return sauna


@router.put("/{sauna_id}", response_model=Sauna)
async def update_sauna(
    sauna_id: int,
    sauna_update: Sauna,
    session: Session = Depends(get_session)
):
    """Update a sauna"""
    sauna = session.get(Sauna, sauna_id)
    if not sauna:
        raise HTTPException(status_code=404, detail="Sauna not found")
    
    # Update fields
    sauna.name = sauna_update.name
    sauna.latitude = sauna_update.latitude
    sauna.longitude = sauna_update.longitude
    sauna.rating = sauna_update.rating
    sauna.description = sauna_update.description
    
    session.add(sauna)
    session.commit()
    session.refresh(sauna)
    return sauna


@router.delete("/{sauna_id}", status_code=204)
async def delete_sauna(sauna_id: int, session: Session = Depends(get_session)):
    """Delete a sauna"""
    sauna = session.get(Sauna, sauna_id)
    if not sauna:
        raise HTTPException(status_code=404, detail="Sauna not found")
    
    session.delete(sauna)
    session.commit()
    return None
