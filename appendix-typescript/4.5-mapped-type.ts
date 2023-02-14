

type Feature = {
    event: string;
    coupon: string;
}
type FeatureKeys = keyof Feature;  // 'event' | 'coupon' 과 동일 

const aEvent:FeatureKeys = 'event' ;
const aCoupon: FeatureKeys = 'coupon' ;
// const aSale:FeatureKeys = 'sale'; // 컴파일 에러

type FeaturePermission = { [key in keyof Feature]?: boolean };

// utility type
type PartialFeature = Partial<Feature>;

// readonly
type ReadonlyFeature = Readonly<Feature>;