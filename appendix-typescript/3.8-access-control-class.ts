class Parent {
    openInfo = "공개 정보"
    protected lagacy = "유산";
    private parentSecret = "부모의 비밀 정보";

    checkMySecret() {
        console.log(this.parentSecret);
    }
}

class Child extends Parent{
    private secret = "자녀의 비밀 정보";

    // protected 확인 가능
    checkLagacy() {
        console.log(super.lagacy);        
    }

    checkParentSecret() {
        // console.log(super.parentSecret);
    }
}

class Someone {
    checkPublicInfo() {
        const p = new Parent();
        console.log(p.openInfo);
        // console.log(p.lagacy)
        // console.log(p.parentSecret)
    }
}

